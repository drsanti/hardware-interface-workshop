import { BrowserRouter, Route, Routes } from "react-router";

/*
 * Enable exactly one example: uncomment its import + Route, comment the others.
 * Same idea as firmware rtos-labs/main/main.c (one exNN_start at a time).
 */
// import { Ex00GettingStarted } from "@/pages/ex00-getting-started";
// import { Ex01ReactComponent } from "@/pages/ex01-react-component";
// import { Ex02WebSerialPicker } from "@/pages/ex02-web-serial-picker";
// import { Ex03BoardHello } from "@/pages/ex03-board-hello";
// import { Ex04RgbLed } from "@/pages/ex04-rgb-led";
// import { Ex05LedStudio } from "@/pages/ex05-led-studio";
// import { Ex06SfxPlay } from "@/pages/ex06-sfx-play";
// import { Ex07SfxVolume } from "@/pages/ex07-sfx-volume";
// import { Ex08SfxParams } from "@/pages/ex08-sfx-params";
// import { Ex09SfxMelody } from "@/pages/ex09-sfx-melody";
// import { Ex10SfxStudio } from "@/pages/ex10-sfx-studio";
// import { Ex11MicHello } from "@/pages/ex11-mic-hello";
// import { Ex12MicVu } from "@/pages/ex12-mic-vu";
// import { Ex13MicGain } from "@/pages/ex13-mic-gain";
// import { Ex14MicWave } from "@/pages/ex14-mic-wave";
// import { Ex15MicStudio } from "@/pages/ex15-mic-studio";
// import { Ex16KeyHello } from "@/pages/ex16-key-hello";
// import { Ex17KeyAction } from "@/pages/ex17-key-action";
// import { Ex18BattHello } from "@/pages/ex18-batt-hello";
// import { Ex19BattWarn } from "@/pages/ex19-batt-warn";
// import { Ex20ImuHello } from "@/pages/ex20-imu-hello";
// import { Ex21ImuShake } from "@/pages/ex21-imu-shake";
// import { Ex22RtcSync } from "@/pages/ex22-rtc-sync";
// import { Ex23SoundLed } from "@/pages/ex23-sound-led";
// import { Ex24ButtonAppliance } from "@/pages/ex24-button-appliance";
// import { Ex25CapsGate } from "@/pages/ex25-caps-gate";
// import { Ex26MicFft } from "@/pages/ex26-mic-fft";
// import { Ex27MicSpectrogram } from "@/pages/ex27-mic-spectrogram";
// import { Ex28MicRecorder } from "@/pages/ex28-mic-recorder";
// import { Ex29MicFilter } from "@/pages/ex29-mic-filter";
// import { Ex30MicFeatures } from "@/pages/ex30-mic-features";
// import { Ex31MicPitch } from "@/pages/ex31-mic-pitch";
// import { Ex32MicClassify } from "@/pages/ex32-mic-classify";
// import { Ex33MicReact } from "@/pages/ex33-mic-react";
import { Ex34SenseAppliance } from "@/pages/ex34-sense-appliance";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Ex00GettingStarted />} /> */}
        {/* <Route path="/" element={<Ex01ReactComponent />} /> */}
        {/* <Route path="/" element={<Ex02WebSerialPicker />} /> */}
        {/* <Route path="/" element={<Ex03BoardHello />} /> */}
        {/* <Route path="/" element={<Ex04RgbLed />} /> */}
        {/* <Route path="/" element={<Ex05LedStudio />} /> */}
        {/* <Route path="/" element={<Ex06SfxPlay />} /> */}
        {/* <Route path="/" element={<Ex07SfxVolume />} /> */}
        {/* <Route path="/" element={<Ex08SfxParams />} /> */}
        {/* <Route path="/" element={<Ex09SfxMelody />} /> */}
        {/* <Route path="/" element={<Ex10SfxStudio />} /> */}
        {/* <Route path="/" element={<Ex11MicHello />} /> */}
        {/* <Route path="/" element={<Ex12MicVu />} /> */}
        {/* <Route path="/" element={<Ex13MicGain />} /> */}
        {/* <Route path="/" element={<Ex14MicWave />} /> */}
        {/* <Route path="/" element={<Ex15MicStudio />} /> */}
        {/* <Route path="/" element={<Ex16KeyHello />} /> */}
        {/* <Route path="/" element={<Ex17KeyAction />} /> */}
        {/* <Route path="/" element={<Ex18BattHello />} /> */}
        {/* <Route path="/" element={<Ex19BattWarn />} /> */}
        {/* <Route path="/" element={<Ex20ImuHello />} /> */}
        {/* <Route path="/" element={<Ex21ImuShake />} /> */}
        {/* <Route path="/" element={<Ex22RtcSync />} /> */}
        {/* <Route path="/" element={<Ex23SoundLed />} /> */}
        {/* <Route path="/" element={<Ex24ButtonAppliance />} /> */}
        {/* <Route path="/" element={<Ex25CapsGate />} /> */}
        {/* <Route path="/" element={<Ex26MicFft />} /> */}
        {/* <Route path="/" element={<Ex27MicSpectrogram />} /> */}
        {/* <Route path="/" element={<Ex28MicRecorder />} /> */}
        {/* <Route path="/" element={<Ex29MicFilter />} /> */}
        {/* <Route path="/" element={<Ex30MicFeatures />} /> */}
        {/* <Route path="/" element={<Ex31MicPitch />} /> */}
        {/* <Route path="/" element={<Ex32MicClassify />} /> */}
        {/* <Route path="/" element={<Ex33MicReact />} /> */}
        <Route path="/" element={<Ex34SenseAppliance />} />
      </Routes>
    </BrowserRouter>
  );
}
