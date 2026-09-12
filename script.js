document.addEventListener('DOMContentLoaded', () => {
    const lever = document.getElementById('lever');
    const spinButton = document.getElementById('spin-button');
    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    const lights = document.querySelectorAll('.light');
    const spinSound = new Audio('audio/slot-machine-spin.wav');
    spinSound.preload = 'auto';
    spinSound.volume = 0.95;

    let isSpinning = false;
    let lightInterval = null;
    let reelAnimations = []; // 存储转轮动画的引用

    // --- 图片资源库 ---
    const allImages = [
        'images/image1.png',
        'images/image2.png',
        'images/image3.png',
        'images/image4.png',
        'images/image5.png',
        'images/image6.png',
        'images/image7.png',
        'images/image8.png',
        'images/image9.png',
        'images/image10.png',
        'images/image11.png',
        'images/image12.png',
        'images/image13.png',
        'images/image14.png',
        'images/image15.png',
        'images/image16.png',
        'images/image17.png',
        'images/image18.png',
        'images/image19.png',
        'images/image20.png',
        'images/image21.png',
        'images/image22.png',
        'images/image23.png',
        'images/image24.png',
        'images/image25.png',
        'images/image26.png',
        'images/image27.png',
        'images/image28.png',
        'images/image29.png',
        'images/image30.png',
        'images/image31.png',
        'images/image32.png',
        'images/image33.png',
        'images/image34.png',
        'images/image35.png',
        'images/image36.png',
        'images/image37.png',
        'images/image38.png',
        'images/image39.png',
        'images/image40.png',
        'images/image41.png',
        'images/image42.png',
        'images/image43.png',
        'images/image44.png',
        'images/image45.png',
        'images/image46.png',
        'images/image47.png'
    ];

    // --- 初始化转轮 ---
    function initReels() {
        console.log('开始初始化转轮...');
        reels.forEach((reel, reelIndex) => {
            if (!reel) {
                console.error('无法找到转轮元素 ' + (reelIndex + 1));
                return;
            }
            
            const strip = reel.querySelector('.reel-strip');
            if (!strip) {
                console.error('无法找到转轮条元素 ' + (reelIndex + 1));
                return;
            }
            
            // 清空现有的内容
            strip.innerHTML = '';
            
            // 创建6个图片元素来实现滚动效果，初始都显示问号图片
            for (let i = 0; i < 6; i++) {
                const img = document.createElement('img');
                img.src = 'images/question.png';
                img.alt = '图标';
                img.style.width = '100%';
                img.style.height = '160px';
                img.style.objectFit = 'contain';
                img.style.padding = '18px';
                img.style.boxSizing = 'border-box';
                
                img.onerror = function() {
                    console.error('图片加载失败:', img.src);
                };
                
                strip.appendChild(img);
            }
            console.log('初始化转轮 ' + (reelIndex + 1) + ' 完成');
        });
        console.log('所有转轮初始化完成');
    }

    // --- 开始转动 ---
    function startSpin() {
        if (isSpinning) return;
        isSpinning = true;
        spinButton.disabled = true;

        spinSound.currentTime = 0;
        spinSound.play().catch(error => console.warn('音效播放失败:', error));
        
        // 启动指示灯闪烁
        startLights();

        // 清除之前的动画引用
        reelAnimations.forEach(animation => animation.cancel());
        reelAnimations = [];
        
        // 为每个转轮生成最终选定的图片
        const finalImages = reels.map(() => {
            return allImages[Math.floor(Math.random() * allImages.length)];
        });
        
        // 三个转轮依次停止，总时长控制在 5.6 秒
        const stopDurations = [3400, 4500, 5600];
        
        reels.forEach((reel, index) => {
            if (!reel) return;
            
            const strip = reel.querySelector('.reel-strip');
            if (!strip) return;
            
            animateReel(strip, finalImages[index], index, stopDurations[index]);
        });
    }

    // --- 转轮动画函数 ---
    function animateReel(strip, finalImage, reelIndex, duration) {
        const reelHeight = 160;
        const totalImages = 28 + reelIndex * 8;

        strip.replaceChildren();
        for (let i = 0; i < totalImages; i++) {
            const img = document.createElement('img');
            img.src = i === totalImages - 1 ? finalImage : allImages[Math.floor(Math.random() * allImages.length)];
            img.alt = '图标';
            strip.appendChild(img);
        }

        const distance = (totalImages - 1) * reelHeight;
        strip.style.transform = 'translateY(0)';

        const animation = strip.animate([
            { transform: 'translateY(0)', offset: 0, easing: 'linear' },
            { transform: `translateY(${-distance * 0.72}px)`, offset: 0.45, easing: 'linear' },
            { transform: `translateY(${-distance * 0.92}px)`, offset: 0.72, easing: 'ease-out' },
            { transform: `translateY(${-distance}px)`, offset: 1 }
        ], { duration, fill: 'forwards' });

        animation.onfinish = () => {
            strip.style.transform = `translateY(${-distance}px)`;
            animation.cancel();
            console.log('转轮 ' + (reelIndex + 1) + ' 停止，显示图片: ' + finalImage);

            if (reelIndex === reels.length - 1) {
                setTimeout(() => {
                    isSpinning = false;
                    spinButton.disabled = false;
                    stopLights();
                }, 500);
            }
        };

        reelAnimations[reelIndex] = animation;
    }

    // --- 启动指示灯 ---
    function startLights() {
        let currentLight = 0;
        // 立即点亮第一个灯
        if (lights.length > 0) {
            lights[currentLight].classList.add('active');
        }
        
        // 依次循环点亮灯
        lightInterval = setInterval(() => {
            // 熄灭当前灯
            if (lights.length > 0) {
                lights[currentLight].classList.remove('active');
                // 切换到下一个灯
                currentLight = (currentLight + 1) % lights.length;
                // 点亮下一个灯
                lights[currentLight].classList.add('active');
            }
        }, 300); // 每300毫秒切换一次
    }

    // --- 停止指示灯 ---
    function stopLights() {
        // 清除定时器
        if (lightInterval) {
            clearInterval(lightInterval);
            lightInterval = null;
        }
        // 熄灭所有灯
        lights.forEach(light => light.classList.remove('active'));
    }

    // --- 拉杆点击事件 ---
    if (lever) {
        lever.addEventListener('click', () => {
            if (isSpinning) return;
            
            // 拉杆动画
            lever.classList.add('pulled');
            
            setTimeout(() => {
                lever.classList.remove('pulled');
                startSpin();
            }, 300);
        });
    }

    // --- 按钮点击事件 ---
    if (spinButton) {
        spinButton.addEventListener('click', () => {
            startSpin();
        });
    }

    // --- 初始化 ---
    initReels();
});
