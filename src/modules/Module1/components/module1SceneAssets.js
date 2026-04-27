import payAttentionSvgRaw from '../../../assets/pay-attention-not-css.svg?raw'
import eyesSvgRaw from '../../../assets/eyes-not-css.svg?raw'
import '../../../assets/pay-attention-styles.css'
import '../../../assets/eyes-styles.css'

export const payAttentionSvg = payAttentionSvgRaw
export const eyesSvg = eyesSvgRaw

export const staticPayAttentionSvg = payAttentionSvgRaw
  .replace('class="animated"', 'class="section-c-static-scene"')
  .replaceAll('animator-active', '')
