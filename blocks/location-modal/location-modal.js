export default async function decorate(block) {
    // console.log("asbhsiab", block);

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'floating-input-wrapper';

    // Create input + label
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'floatingInput';
    input.name = 'floatingInput';
    input.placeholder = ' '; // required for floating label animation
    input.className = 'floating-input';
    input.autocomplete = 'on';
    input.maxLength = 6;
    input.autocomplete = 'pincode';

    const label = document.createElement('label');
    label.htmlFor = 'floatingInput';
    label.textContent = 'Pincode'; // ✅ correct label text

    // Append input and label inside wrapper
    wrapper.append(input, label);

    // ✅ Find <p>Pincode</p> manually (no :contains)
    const allParagraphs = block.querySelectorAll('p');
    let pincodePara = null;

    allParagraphs.forEach((p) => {
        if (p.textContent.trim().toLowerCase() === 'pincode') {
            pincodePara = p;
        }
    });

    if (pincodePara) {
        const parentDiv = pincodePara.closest('div');
        if (parentDiv) {
            parentDiv.replaceWith(wrapper);
            // console.log("✅ Replaced <p>Pincode</p> with floating input wrapper");
        }
    } else {
        console.warn("⚠️ Could not find <p>Pincode</p> element inside modal");
        block.append(wrapper); // fallback
    }

    // Add focus/blur event handlers for animation
    input.addEventListener('focus', () => {
        wrapper.classList.add('active');
    });

    input.addEventListener('blur', () => {
        if (!input.value.trim()) {
            wrapper.classList.remove('active');
        }
    });

    // let applyButton = document.querySelector('.modal-parent>div:nth-child(5)>div>p');
    // console.log(applyButton,"");

    // applyButton.addEventListener('click', (e) => {
    //     if (!applyButton.classList.contains('active')) {
    //         e.preventDefault();
    //         return;
    //     }
    //     console.log('📍 Pincode submitted:', input.value);
    //     // TODO: Add API call or close modal logic here
    // });

    // setTimeout(() => {
    //     // setupLocationClickListener();
    //     const locationLi = document.querySelector('.modal-parent > div:nth-child(5) > div > p');
    //     console.log("✅ Found location element:", locationLi);

    //     if (locationLi) {
    //         locationLi.addEventListener('click', async () => {
    //             console.log('📍 Mumbai location clicked!');
    //             // Add your modal logic or API call here
    //         });
    //     } else {
    //         console.warn('⚠️ Location <p> element not found');
    //     }
    // }, 1000);

    // const locationLi = document.querySelector('.modal-parent > div:nth-child(5) > div > p');
    // console.log("✅ Found location element:", locationLi);

    // if (locationLi) {
    //     locationLi.addEventListener('click', async () => {
    //         console.log('📍 Mumbai location clicked!');
    //         // Add your modal logic or API call here
    //     });
    // } else {
    //     console.warn('⚠️ Location <p> element not found');
    // }



    //     inputPincode.addEventListener('input', () => {
    //         const isActive = inputPincode.value.trim().length === 6;
    //         applyBtn.classList.toggle('active', isActive);
    //         applyBtn.style.opacity = isActive ? '1' : '0.6';
    //     });
}
