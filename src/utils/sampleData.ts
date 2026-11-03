import { BgmTrack, VoiceOption, DramaFrame } from '../types/natok';

export const BGM_PRESETS: BgmTrack[] = [
  { id: 'none', name: 'No BGM', duration: '0:00', genre: 'Mute' },
  { id: 'bgm_epic', name: 'Epic Cinematic Dramatic Adventure Trailer [Creative Commons]...', duration: '3:45', genre: 'Cinematic' },
  { id: 'bgm_slava', name: 'SLAVA FUNK (MP3_160K).mp3', duration: '2:15', genre: 'Phonk/Action' },
  { id: 'bgm_schizo', name: 'Schizo(MP3_160K).mp3', duration: '3:10', genre: 'Dark Tension' },
  { id: 'bgm_maya', name: 'মায়াফিলমের শেষ দৃশ্য ব্যাকগ্রাউন্ড Music. Download now(M...', duration: '4:20', genre: 'Tragic Drama' },
];

export const GEMINI_VOICES: VoiceOption[] = [
  {
    id: 'kore',
    name: 'Kore',
    provider: 'gemini',
    voiceId: 'Kore',
    gender: 'female',
    sampleText: 'শুভকামনা জানাচ্ছি আমাদের চ্যানেলের সকল প্রিয় নাটকপ্রেমী দর্শকদের। আশা করি আপনারা সবাই অনেক ভালো আছেন।',
  },
  {
    id: 'aoede',
    name: 'Aoede',
    provider: 'gemini',
    voiceId: 'Aoede',
    gender: 'female',
    sampleText: 'নাটকের আজকের পর্বে এমন এক গোপন সত্য ফাঁস হবে যা পুরো পরিবারকে স্তম্ভিত করে দেবে।',
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    provider: 'gemini',
    voiceId: 'Zephyr',
    gender: 'male',
    recommended: true,
    sampleText: 'আসসালামু আলাইকুম বন্ধুরা! আজকে আপনারা দেখবেন দুনিয়া টাকার গোলাম নাটকের অবিশ্বাস্য ক্লাইম্যাক্স!',
  },
  {
    id: 'fenrir',
    name: 'Fenrir',
    provider: 'gemini',
    voiceId: 'Fenrir',
    gender: 'male',
    sampleText: 'টাকার লোভে মানুষ কত নিচে নামতে পারে, তার নির্মম প্রমাণ আজকের এই রোমহর্ষক ঘটনা।',
  },
  {
    id: 'charon',
    name: 'Charon',
    provider: 'gemini',
    voiceId: 'Charon',
    gender: 'male',
    sampleText: 'ভিডিওটি ভালো লাগলে এখনি লাইক দিন এবং আমাদের চ্যানেলটি সাবস্ক্রাইব করে বেল আইকনে চাপুন।',
  },
  {
    id: 'puck',
    name: 'Puck',
    provider: 'gemini',
    voiceId: 'Puck',
    gender: 'male',
    sampleText: 'হ্যালো বন্ধুরা! নতুন নাটকের রিভিউ নিয়ে চলে আসলাম, পুরো ভিডিওটা শেষ পর্যন্ত দেখতে থাকুন!',
  },
];

export const BROWSER_VOICES: VoiceOption[] = [
  {
    id: 'pradeep_bd',
    name: 'PradeepNeural BD',
    provider: 'browser',
    voiceId: 'bn-BD-PradeepNeural',
    gender: 'male',
    sampleText: 'শুভকামনা জানাচ্ছি আমাদের চ্যানেলের সকল প্রিয় নাটকপ্রেমী দর্শকদের। আশা করি আপনারা সবাই অনেক ভালো আছেন।',
  },
  {
    id: 'nobanita_bd',
    name: 'NobanitaNeural BD',
    provider: 'browser',
    voiceId: 'bn-BD-NobanitaNeural',
    gender: 'female',
    sampleText: 'আসসালামু আলাইকুম বন্ধুরা, আজকের পর্বে আপনারা দেখবেন দুনিয়া টাকার গোলাম নাটকের নতুন কিছু চমক।',
  },
  {
    id: 'bashkar_in',
    name: 'BashkarNeural IN',
    provider: 'browser',
    voiceId: 'bn-IN-BashkarNeural',
    gender: 'male',
    sampleText: 'গল্পের এই মোড়ে এমন এক ঘটনা ঘটতে চলেছে যা আপনারা হয়তো কখনো প্রত্যাশা করেননি।',
  },
  {
    id: 'tanishaa_in',
    name: 'TanishaaNeural IN',
    provider: 'browser',
    voiceId: 'bn-IN-TanishaaNeural',
    gender: 'female',
    sampleText: 'নাটকটির পরবর্তী পর্বের আপডেট সবার আগে পেতে আমাদের সাথেই যুক্ত থাকুন। ধন্যবাদ সবাইকে!',
  },
];

// Helper to generate crisp drama actor scene images on a 16:9 canvas
function generateDramaSceneDataUrl(
  title: string,
  sceneNumber: number,
  actorDesc: string,
  palette: [string, string, string],
  expression: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Cinematic background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 640, 360);
  bgGrad.addColorStop(0, palette[0]);
  bgGrad.addColorStop(0.5, palette[1]);
  bgGrad.addColorStop(1, palette[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 640, 360);

  // Lighting overlay
  const spotGrad = ctx.createRadialGradient(320, 140, 30, 320, 180, 340);
  spotGrad.addColorStop(0, 'rgba(255, 230, 180, 0.25)');
  spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, 640, 360);

  // Background room elements (window blinds / wall shelf / light)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(40, 40 + i * 40, 180, 18);
  }

  // Draw stylized character silhouette & face
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 20;

  // Body / Shirt
  ctx.fillStyle = sceneNumber % 2 === 0 ? '#b85c1e' : '#283e4a'; // Brown jacket vs Dark shirt
  ctx.beginPath();
  ctx.ellipse(320, 330, 150, 110, 0, 0, Math.PI * 2);
  ctx.fill();

  // White inner collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(290, 240);
  ctx.lineTo(320, 290);
  ctx.lineTo(350, 240);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#c68656';
  ctx.fillRect(295, 200, 50, 50);

  // Head
  ctx.fillStyle = '#d49667';
  ctx.beginPath();
  ctx.ellipse(320, 160, 55, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair & Beard (Bengali hero style like in the video)
  ctx.fillStyle = '#1a1412';
  // Hair
  ctx.beginPath();
  ctx.ellipse(320, 120, 65, 45, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(265, 150, 15, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(375, 150, 15, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Beard
  ctx.beginPath();
  ctx.arc(320, 185, 38, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#1e1614';
  ctx.stroke();

  // Eyes or Sunglasses (Sunglasses for swagger scenes)
  if (sceneNumber === 1 || sceneNumber === 5 || sceneNumber === 9 || sceneNumber === 13) {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(280, 145, 36, 22, 6);
    ctx.roundRect(324, 145, 36, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(316, 154);
    ctx.lineTo(324, 154);
    ctx.stroke();
  } else {
    // Expressive Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(295, 152, 10, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(345, 152, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(295, 152, 4.5, 0, Math.PI * 2);
    ctx.arc(345, 152, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Film letterbox overlay / bottom banner
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 310, 640, 50);

  // Natok Title watermark
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('দুনিয়া টাকার গোলাম', 20, 335);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '12px sans-serif';
  ctx.fillText(`${actorDesc} • ${expression}`, 20, 352);

  // Timestamp watermark top right
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.roundRect(530, 15, 95, 26, 4);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 13px monospace';
  const min = Math.floor(sceneNumber * 2 + 3);
  const sec = (sceneNumber * 17) % 60;
  const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  ctx.fillText(timeStr, 545, 33);

  return canvas.toDataURL('image/jpeg', 0.85);
}

// Generate default set of initial frames
export function getInitialDramaFrames(): DramaFrame[] {
  const sceneDescriptions = [
    { desc: 'নায়কের এন্ট্রি - সানগ্লাস লুক', expression: 'আত্মবিশ্বাসী', palette: ['#1e293b', '#0f172a', '#020617'] as [string, string, string] },
    { desc: 'অফিসে তর্কাতর্কি ও দ্বন্দ্ব', expression: 'উত্তেজিত', palette: ['#334155', '#1e293b', '#0f172a'] as [string, string, string] },
    { desc: 'মায়ের সাথে আবেগঘন কথোপকথন', expression: 'চিন্তিত', palette: ['#292524', '#1c1917', '#0c0a09'] as [string, string, string] },
    { desc: 'ব্যাডমিন্টন কোর্টে খেলোয়াড়দের দৃশ্য', expression: 'নাটকীয়', palette: ['#14532d', '#052e16', '#022c22'] as [string, string, string] },
    { desc: 'গাড়িতে বসে চরম সিদ্ধান্ত গ্রহণ', expression: 'প্রতিশোধপরায়ণ', palette: ['#451a03', '#271004', '#100502'] as [string, string, string] },
    { desc: 'চাচাতো ভাইয়ের সাথে চরম বিতর্ক', expression: 'ক্রুদ্ধ', palette: ['#4c0519', '#27040d', '#130206'] as [string, string, string] },
    { desc: 'নায়কের চিন্তাগ্রস্ত নিঃসঙ্গ মুহূর্ত', expression: 'একাকীত্ব', palette: ['#1e1b4b', '#0f0e26', '#060513'] as [string, string, string] },
    { desc: 'টাকার ব্যাগ নিয়ে রহস্যজনক মোড়', expression: 'আতঙ্কিত', palette: ['#3b0764', '#1d0333', '#0a0112'] as [string, string, string] },
    { desc: 'পুলিশের আগমন ও চরম টানাপোড়েন', expression: 'স্তম্ভিত', palette: ['#172554', '#0d1838', '#050b1a'] as [string, string, string] },
    { desc: 'নায়িকা এসে সত্য প্রকাশ করল', expression: 'আবেগাপ্লুত', palette: ['#701a75', '#3b0d3d', '#1a051b'] as [string, string, string] },
    { desc: 'হাসপাতালের করিডোরে কান্নাকাটি', expression: 'হৃদয়বিদারক', palette: ['#1f2937', '#111827', '#030712'] as [string, string, string] },
    { desc: 'শেষ দৃশ্যে অপ্রত্যাশিত চমক', expression: 'ক্লাইম্যাক্স', palette: ['#7f1d1d', '#450a0a', '#1a0303'] as [string, string, string] },
    // Some duplicates for duplicate filter showcase
    { desc: 'নায়কের এন্ট্রি - অনুরূপ ফ্রেম (ডুপ্লিকেট)', expression: 'আত্মবিশ্বাসী', palette: ['#1e293b', '#0f172a', '#020617'] as [string, string, string] },
    { desc: 'অফিসে তর্কাতর্কি (অনুরূপ ফ্রেম)', expression: 'উত্তেজিত', palette: ['#334155', '#1e293b', '#0f172a'] as [string, string, string] },
    { desc: 'মায়ের সাথে কথা (অনুরূপ ফ্রেম)', expression: 'চিন্তিত', palette: ['#292524', '#1c1917', '#0c0a09'] as [string, string, string] },
    { desc: 'ব্যাডমিন্টন কোর্ট (অনুরূপ ফ্রেম)', expression: 'নাটকীয়', palette: ['#14532d', '#052e16', '#022c22'] as [string, string, string] },
  ];

  return sceneDescriptions.map((scene, idx) => {
    const isDup = idx >= 12;
    const originalIdx = isDup ? idx - 12 + 1 : undefined;
    const similarity = isDup ? 92 + (idx % 5) : 0;
    const dataUrl = generateDramaSceneDataUrl('দুনিয়া টাকার গোলাম', idx + 1, scene.desc, scene.palette, scene.expression);
    const min = Math.floor(idx * 2 + 1);
    const sec = (idx * 23) % 60;

    return {
      id: `frame_${idx + 1}`,
      frameNumber: idx + 1,
      dataUrl,
      timestamp: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`,
      timestampSeconds: min * 60 + sec,
      isDuplicate: isDup,
      duplicateOf: originalIdx,
      similarityScore: similarity,
      selected: false,
    };
  });
}

export const DEFAULT_SCRIPT = `আসসালামু আলাইকুম বন্ধুরা, আজকের পর্বে আপনারা দেখবেন দুনিয়া টাকার গোলাম নাটকের নতুন কিছু চমক এবং আকর্ষণীয় কিছু টুইস্ট যেগুলো আপনাদের কখনোই জানা ছিল না। গল্পের শুরুতেই আমরা দেখতে পাই নায়কের জীবনে এক অভাবনীয় টানাপোড়েন শুরু হয়, যেখানে স্বার্থ আর সম্পর্কের মাঝে এক চরম লড়াই বাধে। ভিডিওটি ভালো লাগলে অবশ্যই লাইক কমেন্ট ও আমাদের চ্যানেলটি সাবস্ক্রাইব করবেন নিয়মিত এরকম নাটকের আপডেট ভিডিও পাওয়ার জন্য। সবাই সুস্থ থাকবেন ভালো থাকবেন, আল্লাহ হাফেজ।`;

export const BUNDLED_VIDEO_PATH = '/assets/aistudio/_________________Natok_Automation_Pro______________________________________767a4bbf.mp4';
