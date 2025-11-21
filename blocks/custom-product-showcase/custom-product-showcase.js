import { render as pdpRender } from '@dropins/storefront-pdp/render.js';
import ProductHeader from '@dropins/storefront-pdp/containers/ProductHeader.js';
import ProductPrice from '@dropins/storefront-pdp/containers/ProductPrice.js';

/**
 * Custom Product Showcase Block
 * Shows product info in a custom layout
 */
export default async function decorate(block) {
  // Get configuration from DA.live
  const config = {};
  [...block.children].forEach((row) => {
    const [key, value] = row.children;
    config[key?.textContent?.toLowerCase()] = value?.textContent;
  });

  // Create custom layout
  const fragment = document.createRange().createContextualFragment(`
    <div class="custom-showcase">
      <div class="showcase__header">
        <h2>Featured Product</h2>
      </div>
      <div class="showcase__content">
        <div class="showcase__title"></div>
        <div class="showcase__price"></div>
        <div class="showcase__cta">
          <a href="/products/${config.sku || 'default'}" class="button primary">
            View Product
          </a>
        </div>
      </div>
    </div>
  `);

  const $title = fragment.querySelector('.showcase__title');
  const $price = fragment.querySelector('.showcase__price');

  // Use dropins for functionality
  await Promise.all([
    pdpRender.render(ProductHeader, {})($title),
    pdpRender.render(ProductPrice, {})($price),
  ]);

  // Replace block content
  block.textContent = '';
  block.appendChild(fragment);
}