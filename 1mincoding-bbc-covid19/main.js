(() => {
/* 전역변수 사용을 막기 위한 즉시 실행 익명 함수 */

    const actions = {
        birdFlies(key) {
            if (key) {
                document.querySelector('[data-index="2"] .bird').style.transform = 'translate(' + window.innerWidth + 'px)';
                // 유튜브에서는 다음과 같았다 => 'translateX(${window.innerWidth}px)';
                // 현재 내 vscode에서 작동하지 않아서 다음과 같이 수정했다.
            } else {
                document.querySelector('[data-index="2"] .bird').style.transform = 'translateX(-100%)';
            }
        },

        birdFlies2(key) {
            if (key) {
                document.querySelector('[data-index="5"] .bird').style.transform = 'translate(' + window.innerWidth + 'px, ' + (-window.innerHeight * 0.7) + 'px)';
            } else {
                document.querySelector('[data-index="5"] .bird').style.transform = 'translateX(-100%)';
            }
        }
    };

    const stepElems = document.querySelectorAll('.step');
    const graphicElems = document.querySelectorAll('.graphic-item');
    
    // 현재 활성화된(visible 클래스가 붙은) .graphic-item을 지정
    let currentItem = graphicElems[0];
    let ioIndex;

    const io = new IntersectionObserver((entries, observer) => {
        // 곱하기 1을 해주는 이유는 "entries[0].target.dataset.index"가 문자열이라 1을 곱해주면 쉽게 정수로 캐스팅된다.
        ioIndex = entries[0].target.dataset.index * 1;
        // console.log(ioIndex);
    });

    for (let i=0; i<stepElems.length; i++) {
        io.observe(stepElems[i]);
        // stepElems[i].setAttribute('data-index',i);
        stepElems[i].dataset.index = i;
        graphicElems[i].dataset.index = i;
    }

    function activate(action) {
        currentItem.classList.add('visible');

        if (action) {
            actions[action](true);
        }
    }

    function inactivate(action) {
        currentItem.classList.remove('visible');

        if (action) {
            actions[action](false);
        }
    }

    window.addEventListener('scroll', () => {
        let step;
        let boundingRect;
        // let temp = 0; // 루프가 얼마나 돌아가는지 확인했던 변수

        // for (let i=0; i<stepElems.length; i++) {
        for (let i=ioIndex-1; i<ioIndex+2; i++) {
            step = stepElems[i];
            if (!step) continue;

            boundingRect = step.getBoundingClientRect();
            // console.log(boundingRect.top);

            // temp++;

            if (boundingRect.top > window.innerHeight * 0.1 &&
                boundingRect.top < window.innerHeight * 0.8) {
                // console.log(step.dataset.index);

                // "currentItem"이 있으면 visible을 지워주자
                /* if (currentItem) {
                    inactivate();
                } */
                inactivate(currentItem.dataset.action);

                currentItem = graphicElems[step.dataset.index];
                activate(currentItem.dataset.action);

            }

            // console.log(temp);
        }
    })

    // 페이지가 새로고침(load) 되었을 경우 페이지 위치를 상단으로 옮겨준다.
    window.addEventListener('load', () => {
        setTimeout(() => scrollTo(0, 0), 100);
    });

    activate();

})();