// src/composables/useGlobals.ts
import { ref } from 'vue';

export function useGlobals() {

  // arcgisToken
  const accessToken = ref('AAPTxy8BH1VEsoebNVZXo8HurMwi75iMmH8_ATZWBZ9xqum5ptX7r8guWn0h29FFT_5S7KCH5xrFe171oR96pAO2EL78Qg48E2hYyU6YZRl39k4mysE3GPOltTjqm5A6_wAGYj8zb0fQKtVxc3DOTYuH_iyMR6Qc8bpQ0mG7eYbfwSAjYQUliwdhR6C4p6qU5Q7eDb28AIHSde4pKX-DRTT97lpitSXhX4AhEkXD_4n4hW8.AT1_9UIP0usd');

  const cesiumToekn = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzdkYjNkNS1kYTI0LTQ3ZWUtOThjMy0zMjUzMTljZDk3MmMiLCJpZCI6MTkzMjY4LCJpYXQiOjE3MDY3NzE4NjR9.y_m3Cdy1wFtb4DFP5LCWxRIXM2cIm2X99M_j5e4fYfo')
  // 你可以在这里添加更多的全局状态和方法

  return {
    accessToken,
    cesiumToekn,
    // ... 其他导出的状态和方法
  };
}