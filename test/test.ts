import {getRandomNormal} from '../src/utils.js';

for (let i = 0; i < 1000; i++) {
    console.log(Math.round(getRandomNormal(15.5, 1)));
}