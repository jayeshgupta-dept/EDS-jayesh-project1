import { readBlockConfig, decorateIcons } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/commerce.js';

/**
 * Custom Footer Block
 * Converts React footer component to authorable AEM block
 */
export default async function decorate(block) {
    // debugger;
  // Get configuration from DA.live authoring
  const config = readBlockConfig(block);
  const placeholders = await fetchPlaceholders();

  // Parse navigation items from block content
  const footerData = parseFooterContent(block);

  // Create footer structure
  const fragment = document.createRange().createContextualFragment(`
    <div class="footer-screen-container">
      <div class="footer-inner-container">
        <!-- Desktop/Tablet Layout -->
        <div class="upper-container">
          <div class="left-container">
            <div class="footer-logo-container"></div>
          </div>
          <div class="footer-navbar-list">
            <ul class="navbar-list"></ul>
          </div>
        </div>
        
        <div class="lower-container">
          <div class="lower-left-container">
            <div class="copyrights-container">
              <p></p>
            </div>
            <div class="terms-condition-container">
              <ul></ul>
            </div>
          </div>
          <div class="social-icons-container">
            <ul class="social-icons-list"></ul>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="mobile-container">
          <div class="mobile-footer-logo-container"></div>
          <div class="mobile-social-icons-container">
            <ul class="mobile-social-icons-list"></ul>
          </div>
          <div class="mobile-terms-condition-container">
            <ul></ul>
          </div>
          <div class="mobile-copyrights-container">
            <p></p>
          </div>
        </div>
      </div>
    </div>
  `);

  // Get DOM elements
  const $logoContainer = fragment.querySelector('.footer-logo-container');
  const $mobileLogoContainer = fragment.querySelector('.mobile-footer-logo-container');
  const $navList = fragment.querySelector('.navbar-list');
  const $copyrights = fragment.querySelector('.copyrights-container p');
  const $mobileCopyrights = fragment.querySelector('.mobile-copyrights-container p');
  const $termsContainer = fragment.querySelector('.terms-condition-container ul');
  const $mobileTermsContainer = fragment.querySelector('.mobile-terms-condition-container ul');
  const $socialIcons = fragment.querySelector('.social-icons-list');
  const $mobileSocialIcons = fragment.querySelector('.mobile-social-icons-list');

  // Render logo
  renderLogo($logoContainer, footerData.logo);
  renderLogo($mobileLogoContainer, footerData.logo);

  // Render navigation
  renderNavigation($navList, footerData.navigation);

  // Render copyright
  renderCopyright($copyrights, footerData.copyright);
  renderCopyright($mobileCopyrights, footerData.copyright);

  // Render terms and privacy links
  renderLegalLinks($termsContainer, footerData.legalLinks);
  renderLegalLinks($mobileTermsContainer, footerData.legalLinks);

  // Render social icons
  renderSocialIcons($socialIcons, footerData.socialIcons);
  renderSocialIcons($mobileSocialIcons, footerData.socialIcons);

  // Replace block content
  block.textContent = '';
  block.appendChild(fragment);

  // Decorate icons (converts :icon-name: to SVG)
  decorateIcons(block);
}

/**
 * Parse footer content from DA.live block structure
 */
function parseFooterContent(block) {
  const data = {
    logo: null,
    navigation: [],
    copyright: '',
    legalLinks: [],
    socialIcons: []
  };

  // Parse each row of the block
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1];

      switch (key) {
        case 'logo':
          data.logo = extractLogo(value);
          break;
        case 'navigation':
          data.navigation = extractNavigation(value);
          break;
        case 'copyright':
          data.copyright = value.textContent.trim();
          break;
        case 'legal links':
        case 'legal':
          data.legalLinks = extractLegalLinks(value);
          break;
        case 'social icons':
        case 'social':
          data.socialIcons = extractSocialIcons(value);
          break;
      }
    }
  });

  return data;
}

/**
 * Extract logo from DA.live content
 */
function extractLogo(cell) {
  const img = cell.querySelector('img');
  const link = cell.querySelector('a');
  
  if (img) {
    return {
      src: img.src,
      alt: img.alt || 'Footer Logo',
      link: link ? link.href : '/'
    };
  }
  
  return {
    src: '/icons/logo.svg', // fallback
    alt: 'Footer Logo',
    link: '/'
  };
}

/**
 * Extract navigation items from DA.live content
 */
function extractNavigation(cell) {
  const links = cell.querySelectorAll('a');
  const navigation = [];

  links.forEach((link, index) => {
    navigation.push({
      id: index + 1,
      name: link.textContent.trim(),
      href: link.href,
      hashLink: link.getAttribute('data-hash') || link.textContent.trim()
    });
  });

  return navigation;
}

/**
 * Extract legal links (Terms, Privacy Policy)
 */
function extractLegalLinks(cell) {
  const links = cell.querySelectorAll('a');
  return Array.from(links).map(link => ({
    text: link.textContent.trim(),
    href: link.href
  }));
}

/**
 * Extract social media icons and links
 */
function extractSocialIcons(cell) {
  const links = cell.querySelectorAll('a');
  const icons = [];

  links.forEach((link, index) => {
    const iconName = link.getAttribute('data-icon') || getSocialIconName(link.href);
    icons.push({
      id: index + 1,
      icon: iconName,
      href: link.href,
      title: link.textContent.trim() || iconName
    });
  });

  return icons;
}

/**
 * Guess social media icon name from URL
 */
function getSocialIconName(url) {
  if (url.includes('instagram')) return 'instagram';
  if (url.includes('facebook')) return 'facebook';
  if (url.includes('twitter') || url.includes('x.com')) return 'twitter';
  if (url.includes('linkedin')) return 'linkedin';
  if (url.includes('youtube')) return 'youtube';
  return 'link';
}

/**
 * Render logo component
 */
function renderLogo(container, logoData) {
  if (!logoData) return;

  const logoElement = document.createElement('a');
  logoElement.href = logoData.link;
  logoElement.className = 'footer-logo-link';

  const img = document.createElement('img');
  img.src = logoData.src;
  img.alt = logoData.alt;
  img.className = 'footer-logo';

  logoElement.appendChild(img);
  container.appendChild(logoElement);
}

/**
 * Render navigation list
 */
function renderNavigation(container, navigation) {
  navigation.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    a.textContent = item.name;
    a.href = item.href;
    a.addEventListener('click', (e) => {
      // Handle scroll to section functionality
      if (item.href.startsWith('#')) {
        e.preventDefault();
        scrollToSectionWithOffset(item.hashLink, 100);
      }
    });

    li.appendChild(a);
    container.appendChild(li);
  });
}

/**
 * Render copyright text
 */
function renderCopyright(container, copyright) {
  if (copyright) {
    container.textContent = copyright;
  }
}

/**
 * Render legal links (Terms, Privacy)
 */
function renderLegalLinks(container, legalLinks) {
  legalLinks.forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    a.textContent = link.text;
    a.href = link.href;
    a.addEventListener('click', (e) => {
      if (link.href.startsWith('/')) {
        e.preventDefault();
        window.location.href = link.href;
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });

    li.appendChild(a);
    container.appendChild(li);
  });
}

/**
 * Render social media icons
 */
function renderSocialIcons(container, socialIcons) {
  socialIcons.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = item.title;
    a.className = 'social-icon-link';
    
    // Use AEM's icon system
    a.innerHTML = `:${item.icon}:`;

    li.appendChild(a);
    container.appendChild(li);
  });
}

/**
 * Scroll to section with offset (same as your React function)
 */
function scrollToSectionWithOffset(sectionId, offset = 0) {
  const targetElement = document.getElementById(sectionId);
  if (targetElement) {
    const offsetTop = targetElement.offsetTop;
    window.scrollTo({
      top: offsetTop - offset,
      behavior: 'smooth',
    });
  }
}