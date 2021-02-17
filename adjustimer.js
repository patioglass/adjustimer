const commonPickrComponent = {
    // Main components
    preview: true,
    opacity: true,
    hue: true,

    // Input / output Options
    interaction: {
        hex: true,
        rgba: true,
        hsla: true,
        hsva: true,
        cmyk: true,
        input: true,
        clear: false,
        save: false
    }
};

const commonPickrSwatches = [
    'rgba(244, 67, 54, 1)',
    'rgba(233, 30, 99, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(103, 58, 183, 1)',
    'rgba(63, 81, 181, 1)',
    'rgba(33, 150, 243, 1)',
    'rgba(3, 169, 244, 1)',
    'rgba(0, 188, 212, 1)',
    'rgba(0, 150, 136, 1)',
    'rgba(76, 175, 80, 1)',
    'rgba(139, 195, 74, 1)',
    'rgba(205, 220, 57, 1)',
    'rgba(255, 235, 59, 1)',
    'rgba(255, 193, 7, 1)'
];

window.onload = () => {
    const switchBorderCheckElement = document.querySelector("#switch_border");
    const borderWrap = document.querySelector("#border-wrapper");

    switchBorderCheckElement.addEventListener("change", (e) => {
        const borders = document.querySelectorAll(".word-text-stroke");
        const borderAbled = e.target.checked;

        if (!borderAbled) {
            borders.forEach((el) => {
                el.style.textShadow = 'none';
            })
            borderWrap.style.display = 'none';
        } else {
            const targetColorHex = colorPickers["borderPickr"].getColor().toHEXA().toString();
            borders.forEach((el) => {
                el.style.textShadow = getTextShadow(targetColorHex);
            })
            borderWrap.style.display = 'inline-block';
        }
    })

    // Simple example, see optional options for more configuration.
    const colorPickers = {
        "backgroundPickr": Pickr.create({
            el: '.background-color-picker',
            theme: 'nano', // or 'monolith', or 'nano'
            swatches: commonPickrSwatches,
            components: commonPickrComponent,
            default: '#ccc'
        }),
        "wordPickr": Pickr.create({
            el: '.word-color-picker',
            theme: 'nano',
            swatches: commonPickrSwatches,
            components: commonPickrComponent,
            default: '#77D5FF'
        }),
        "borderPickr": Pickr.create({
            el: '.border-color-picker',
            theme: 'nano',
            swatches: commonPickrSwatches,
            components: commonPickrComponent,
            default: '#000'
        })
    };

    Object.keys(colorPickers).forEach((key) => {
        colorPickers[key].on('init', instance => {
            console.log('Event: "init"', instance);
        }).on('change', (color, source, instance) => {
            const targetColorRGB = color.toRGBA().toString(3);
            const targetColorHex = color.toHEXA().toString();
            switch (key) {
                case "backgroundPickr":
                    // 背景色変更
                    const wrapper = document.querySelector("#wrapper");
                    wrapper.style.backgroundColor = targetColorRGB;
                    break;
                case "wordPickr":
                    // 文字色変更
                    const word = document.querySelector("#remaining_time_wrapper");
                    word.style.color = targetColorRGB;
                    break;
                case "borderPickr":
                    // 縁色変更
                    const borders = document.querySelectorAll(".word-text-stroke");
                    borders.forEach((el) => {
                        el.style.textShadow = getTextShadow(targetColorHex);
                    })
                    break;
                default:
                    break;
            }
            colorPickers[key].applyColor(true);
        });
    })

    const fontSelect = document.querySelector("select");
    fontSelect.addEventListener("change", (e) => {
        const remainingTimeWrapper = document.querySelector("#remaining_time_wrapper");
        remainingTimeWrapper.style.fontFamily = e.target.value;
        console.log(e.target.value);
    })
}

function getTextShadow(targetColorHex) {
    return '4px 4px 3px ' + targetColorHex + ','
    + '-4px  4px 3px ' + targetColorHex + ','
    + '4px -4px 3px ' + targetColorHex + ','
    + '-4px -4px 3px ' + targetColorHex + ','
    + '4px  0px 3px ' + targetColorHex + ','
    + '0px  4px 3px ' + targetColorHex + ','
    + '-4px  0px 3px ' + targetColorHex + ','
    + '0px -4px 3px ' + targetColorHex;
}