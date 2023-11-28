const Hammer = require('hammerjs');
const HandtrackTouch = require('./jammer');
const reqAnimationFrame = (function () {
    return (window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    });
})();

const log = document.querySelector('#log');
const el = document.querySelector('#hit');

const START_X = Math.round((window.innerWidth - el.offsetWidth) / 5);
const START_Y = Math.round((window.innerHeight - el.offsetHeight) / 5);

let ticking = false;
let transform;
let timer;

let iframe = document.querySelector('iframe')

let linkIndex = 0
const links = ['https://www.youtube.com/embed/WmK-UC_QVhg', 'https://www.youtube.com/embed/6sBGhtpJ318', 'https://www.youtube.com/embed/No9yfKXKK5k']
let tab = 'youtube'
let wikiLinks = ['https://en.wikipedia.org/wiki/Wikipedia:Wiki_Game', 'https://en.wikipedia.org/wiki/Actor', 'https://en.wikipedia.org/wiki/Theatre']

const mc = new Hammer.Manager(el, { inputClass: Hammer.TouchInput });

mc.add(new Hammer.Pan({ threshold: 350, pointers: 1 }));
mc.add(new Hammer.Swipe()).recognizeWith(mc.get('pan'));

mc.on('panstart panmove', onPan);
mc.on('panup', changeUp)
mc.on('pandown', changeDown)
mc.on('panright', changeNext)
mc.on('panleft', changePrev)
mc.on('swipe', onSwipe);
mc.on('hammer.input', function (ev) {
    if (ev.isFinal) {
        resetElement();
    }
});

function changeUp() {
    console.log('up')
    tab = 'youtube'
    linkIndex = 0
    iframe.src = links[linkIndex]
}

function changeDown() {
    console.log('next', links[linkIndex])
    tab = 'wiki'
    linkIndex = 0
    iframe.src = wikiLinks[linkIndex]
}

function changeNext() {
    if (linkIndex === 2) {
        linkIndex = 0
    } else {
        linkIndex++
    }
    console.log('next', links[linkIndex])
    if (tab === 'youtube') {
        iframe.src = links[linkIndex]
    } else {
        iframe.src = wikiLinks[linkIndex]
    }
}

function changePrev() {
    if (linkIndex === 0) {
        linkIndex = 2
    } else {
        linkIndex--
    }
    console.log('prev', links[linkIndex])
    if (tab === 'youtube') {
        iframe.src = links[linkIndex]
    } else {
        iframe.src = wikiLinks[linkIndex]
    }
}

function resetElement() {
    el.className = 'animate';
    transform = {
        translate: { x: START_X, y: START_Y }, scale: 1, angle: 0, rx: 0, ry: 0, rz: 0,
    };

    requestElementUpdate();

    if (log.textContent.length > 2000) {
        log.textContent = log.textContent.substring(0, 2000) + '...';
    }
}

function updateElementTransform() {
    let value = ['translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)', 'scale(' + transform.scale + ', ' + transform.scale + ')', 'rotate3d(' + transform.rx + ',' + transform.ry + ',' + transform.rz + ',' + transform.angle + 'deg)'];

    value = value.join(' ');
    // el.textContent = value;
    el.style.webkitTransform = value;
    el.style.mozTransform = value;
    el.style.transform = value;
    ticking = false;
}

function requestElementUpdate() {
    if (!ticking) {
        reqAnimationFrame(updateElementTransform);
        ticking = true;
    }
}

function logEvent(str) {
    //log.insertBefore(document.createTextNode(str +"\n"), log.firstChild);
}

function onPan(ev) {
    el.className = '';
    transform.translate = {
        x: START_X + ev.deltaX, y: START_Y + ev.deltaY,
    };

    requestElementUpdate();
    logEvent(ev.type);
}

function onSwipe(ev) {
    const angle = 50;
    transform.ry = ev.direction & Hammer.DIRECTION_HORIZONTAL ? 1 : 0;
    transform.rx = ev.direction & Hammer.DIRECTION_VERTICAL ? 1 : 0;
    transform.angle = ev.direction & (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_UP) ? angle : -angle;

    clearTimeout(timer);
    timer = setTimeout(function () {
        resetElement();
    }, 300);
    requestElementUpdate();
    logEvent(ev.type);
}

resetElement();

const video = document
    .getElementById('handtrackjs')
    .getElementsByTagName('video')[0];
video.width = 800;
video.height = 450;
const canvas = document
    .getElementById('handtrackjs')
    .getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');

const options = {
    transform: function (prediction, video, target) {
        return {
            x: ((prediction.bbox[0] + 0.5 * prediction.bbox[2]) / video.width) * 1920,
            y: ((prediction.bbox[1] + 0.5 * prediction.bbox[3]) / video.height) * 1200,
            target: target,
        };
    },
};
HandtrackTouch.start(el, video, canvas, options);
