export const MOVIE_INFO = {
  titleEn: 'Incredibles 2',
  titleKo: '인크레더블 2',
  releaseYear: 2018,
  director: 'Brad Bird',
  screenplay: 'Brad Bird',
  productionCompany: 'Pixar Animation Studios',
  distributionCompany: 'Walt Disney Studios',
  sceneDescription: '방에서 온 가족이 중식을 먹으며 슈퍼히어로 활동의 옳고 그름을 두고 언쟁을 벌이는 저녁 식사 장면',
  youtubeTitle: 'Incredibles 2 (2018) - Dinner Scene (2/10)',
  youtubeChannel: 'Cartoon Clips',
  youtubeUrl: 'https://www.youtube.com/watch?v=TbQ_yX_rxNI',
  videoId: 'TbQ_yX_rxNI',
  startSeconds: 18,
  endSeconds: 67,
  practiceRangeFormatted: '0:18 – 1:07',
  author: '정승교',
  studentId: '2022315564',
  courseName: '인공지능과 영어교육 (ENG3088, Sungkyunkwan University)',
  
  // Mandatory one-line credit under video and on finish screen (PRD Section 0-3 #2 & #3)
  oneLineCredit: 'Clip: Incredibles 2 (2018), Walt Disney Studios / Pixar Animation Studios · via YouTube · For educational use only',
  
  // Educational Use Notice (PRD Section 0-2)
  noticeTitleEn: 'Educational use only',
  noticeTitleKo: '교육 목적 전용',
  noticeTextEn: 'This app was made only for non-commercial English learning in the university course AI and English Language Education (ENG3088, Sungkyunkwan University). The film clip is used only to practice listening and speaking (shadowing). It is not sold, shared for profit, downloaded, or edited. All rights to the film belong to its copyright holders.',
  noticeTextKo: '이 앱은 성균관대학교 「인공지능과 영어교육」(ENG3088) 수업의 비영리 영어 학습 목적으로만 제작되었습니다. 영화 장면은 듣기·말하기(쉐도잉) 연습에만 사용하며, 판매·영리적 배포·다운로드·편집을 하지 않습니다. 영화의 모든 권리는 저작권자에게 있습니다.'
};

export const SHADOWING_STEPS = [
  {
    step: 1,
    nameEn: 'Listen',
    nameKo: '듣기',
    descriptionEn: 'Text hidden, just listen 2–3 times.',
    descriptionKo: '문장을 숨기고, 소리에 집중하여 2~3회 들어보세요.',
    defaultTextHidden: true,
  },
  {
    step: 2,
    nameEn: 'Mumble',
    nameKo: '웅얼거리기',
    descriptionEn: 'Text hidden, quietly follow the sound.',
    descriptionKo: '문장을 숨긴 채 소리와 억양을 작게 웅얼거리며 따라해 보세요.',
    defaultTextHidden: true,
  },
  {
    step: 3,
    nameEn: 'Read & Shadow',
    nameKo: '보면서 쉐도잉',
    descriptionEn: 'Text shown, speak together with the video.',
    descriptionKo: '강조 단어를 확인하며 영상 속 배우와 동시에 소리 내어 말하세요.',
    defaultTextHidden: false,
  },
  {
    step: 4,
    nameEn: 'Shadow',
    nameKo: '완전 쉐도잉',
    descriptionEn: 'Text hidden, speak together with the video.',
    descriptionKo: '문장을 가리고 배우의 속도와 억양을 그대로 복사하여 말하세요.',
    defaultTextHidden: true,
  },
] as const;
