// Vietnamese names and texts for the cards and secrets. The English ones are in
// engine/cards.ts and engine/secrets.ts. Texts use the same symbol tags as the
// English texts: {gold:1}, {skill:2}, {points:4}, {sword}, {boot}, {heart}.
// choices: one label per option, in the order of the card's choices.

import type { SecretId } from '../engine/types';

export interface CardVi { name: string; text?: string; choices?: string[] }

const companionDraw = 'Nếu vùng chơi có một đồng hành khác, rút một lá.';
const draw = 'Rút một lá.';

export const CARDS_VI: Record<string, CardVi> = {
  // Bộ bài khởi đầu và Dự trữ
  burgle: { name: 'Trộm vặt' },
  stumble: { name: 'Vấp ngã', text: '+1 Loảng xoảng!' },
  sidestep: { name: 'Né tránh' },
  scramble: { name: 'Leo trèo' },
  mercenary: { name: 'Lính đánh thuê' },
  explore: { name: 'Thám hiểm' },
  secretTome: { name: 'Bí kíp' },
  goblin: { name: 'Ma rừng', text: 'Không bỏ đi sau khi đánh.' },

  // Hành động và vật phẩm
  amuletOfVigor: { name: 'Bùa sinh lực' },
  sleightOfHand: { name: 'Khéo tay', text: 'Bỏ một lá để rút hai lá.' },
  luckyCoin: { name: 'Đồng xu may mắn', text: '+1 Loảng xoảng! Rút một lá.' },
  swagger: { name: 'Vênh váo', text: 'Mỗi Loảng xoảng! bạn gây ra lượt này, +{skill:1}.' },
  tattle: { name: 'Mách lẻo', text: 'Mỗi người chơi khác +1 Loảng xoảng!' },
  moveSilently: { name: 'Đi rón rén', text: '-2 Loảng xoảng!' },
  search: { name: 'Lục soát', text: 'Lượt này, mỗi lần nhận vàng, nhận thêm {gold:1}.' },
  singingSword: { name: 'Gươm Thuận Thiên', text: '+1 Loảng xoảng!' },
  treasureMap: { name: 'Bản đồ kho báu' },
  bootsOfSwiftness: { name: 'Hài thần tốc' },
  wandOfRecall: { name: 'Gậy hồi hương', text: 'Nếu có Bảo vật, dịch chuyển sang phòng bên cạnh.' },
  deadRun: { name: 'Chạy thục mạng', text: '+2 Loảng xoảng! Lượt này không phải dừng ở Hang pha lê.' },
  scepterOfTheApeLord: { name: 'Quyền trượng Vua Khỉ', text: '+3 Loảng xoảng!' },
  silverSpear: { name: 'Giáo bạc' },
  flyingCarpet: { name: 'Chiếu bay', text: 'Lượt này bỏ qua quái vật trong đường hầm và không phải dừng ở Hang pha lê.' },
  underworldDealing: { name: 'Giao dịch ngầm', choices: ['1 Vàng', 'Trả 7 Vàng: hai Bí kíp'] },
  bracersOfAgility: { name: 'Vòng tay nhanh nhẹn', text: 'Rút hai lá.' },
  pickaxe: { name: 'Cuốc chim' },
  elvenBoots: { name: 'Hài tiên', text: draw },
  wandOfWind: { name: 'Gậy gió', choices: ['Dịch chuyển', 'Lấy một bí mật ở phòng bên cạnh'] },
  sneak: { name: 'Lẻn', text: '-2 Loảng xoảng!' },
  elvenCloak: { name: 'Áo tiên', text: '-2 Loảng xoảng! Rút một lá.' },
  elvenDagger: { name: 'Dao găm tiên', text: draw },
  brilliance: { name: 'Lóe sáng', text: 'Rút ba lá.' },

  // Đồng hành
  monkeyBot: { name: 'Khỉ máy', text: '+3 Loảng xoảng! Rút ba lá.' },
  rebelCaptain: { name: 'Đội trưởng Tây Sơn', text: companionDraw },
  rebelScout: { name: 'Thám báo Tây Sơn', text: companionDraw },
  rebelSoldier: { name: 'Lính Tây Sơn', text: companionDraw },
  rebelMiner: { name: 'Thợ mỏ Tây Sơn', text: companionDraw },
  tunnelGuide: { name: 'Người dẫn đường' },
  treasureHunter: { name: 'Thợ săn kho báu', text: 'Thay một lá trong hàng hầm ngục. (Nếu lá mới có biểu tượng rồng tấn công, bỏ qua.)' },
  gemCollector: { name: 'Người sưu tầm ngọc', text: '-2 Loảng xoảng! Lượt này Ngọc rẻ hơn {skill:2}.' },
  theDuke: { name: 'Quan lớn', text: 'Đáng {points:1} cho mỗi 5 vàng bạn có.' },
  masterBurglar: { name: 'Siêu trộm', text: 'Hủy một lá Trộm vặt trong vùng chơi hoặc chồng bài bỏ.' },
  clericOfTheSun: { name: 'Nữ tu Mặt Trời' },
  wizard: { name: 'Thầy pháp', text: 'Đáng {points:2} cho mỗi Bí kíp bạn có.' },
  invoker: { name: 'Người gọi hồn', text: '+1 Loảng xoảng! Dịch chuyển sang phòng bên cạnh.' },
  archaeologist: { name: 'Nhà khảo cổ', text: 'Rút một lá. Nếu có tượng khỉ, +{skill:2}.' },
  apothecary: { name: 'Thầy thuốc nam', text: 'Bỏ một lá để chọn:', choices: ['3 Kiếm', '2 Vàng', 'Hồi 1 máu'] },
  dwarvenPeddler: { name: 'Người bán rong', text: 'Đáng {points:4} nếu có 2 trong số: chén ngọc, trứng rồng, tượng khỉ.' },
  misterWhiskers: { name: 'Ông Mèo', choices: ['Rồng tấn công', '-2 Loảng xoảng!'] },
  koboldMerchant: { name: 'Thương nhân thằn lằn', text: 'Nếu có Bảo vật, +{skill:2}.' },
  mountainKing: { name: 'Sơn Tinh', text: 'Nếu có vương miện, +{sword} và +{boot}.' },
  queenOfHearts: { name: 'Âu Cơ', text: 'Nếu có vương miện, {heart}.' },

  // Ngọc
  sapphire: { name: 'Lam ngọc', text: draw },
  emerald: { name: 'Ngọc lục bảo', text: draw },
  ruby: { name: 'Hồng ngọc', text: draw },
  diamond: { name: 'Kim cương', text: draw },
  dragonsEye: { name: 'Mắt Rồng', text: 'Tầng sâu: chỉ mua ở Tầng sâu. Rút một lá. Đáng {points:10} nếu có Huy hiệu Bậc thầy.' },

  // Cơ quan
  ladder: { name: 'Thang tre' },
  teleporter: { name: 'Cổng dịch chuyển' },
  shrine: { name: 'Miếu thờ', choices: ['1 Vàng', 'Hồi 1 máu'] },
  dragonShrine: { name: 'Đền Rồng', choices: ['2 Vàng', 'Hủy một lá'] },
  theVault: { name: 'Kho báu ngầm', text: 'Tầng sâu (chỉ dùng ở Tầng sâu).' },

  // Quái vật
  orcGrunt: { name: 'Quỷ canh cổng' },
  crystalGolem: { name: 'Người đá ngọc', text: 'Chỉ đánh được trong Hang pha lê.' },
  kobold: { name: 'Thằn lằn tinh' },
  overlord: { name: 'Chúa quỷ' },
  watcher: { name: 'Kẻ canh chừng' },
  animatedDoor: { name: 'Cửa ma' },
  belcher: { name: 'Cóc Tinh' },
  ogre: { name: 'Chằn tinh' },
  caveTroll: { name: 'Quỷ hang', text: 'Tầng sâu (chỉ đánh ở Tầng sâu).' },
};

export const SECRETS_VI: Record<SecretId, { name: string; text: string }> = {
  potionGreaterHealing: { name: 'Thuốc hồi phục lớn', text: 'Dùng trong lượt để hồi 2 máu.' },
  greaterSkillBoost: { name: 'Tăng Kỹ năng lớn', text: 'Nhận 5 Kỹ năng.' },
  greaterTreasure: { name: 'Kho báu lớn', text: 'Tính là 5 Vàng.' },
  flashOfBrilliance: { name: 'Chợt lóe sáng', text: 'Rút ba lá.' },
  chalice: { name: 'Chén ngọc', text: 'Đáng 7 điểm khi kết thúc trò chơi.' },
  potionHealing: { name: 'Thuốc hồi phục', text: 'Dùng trong lượt để hồi 1 máu.' },
  potionSwiftness: { name: 'Thuốc thần tốc', text: 'Dùng trong lượt để nhận 1 Giày.' },
  potionStrength: { name: 'Thuốc sức mạnh', text: 'Dùng trong lượt để nhận 2 Kiếm.' },
  skillBoost: { name: 'Tăng Kỹ năng', text: 'Nhận 2 Kỹ năng.' },
  treasure: { name: 'Kho báu', text: 'Tính là 2 Vàng.' },
  magicSpring: { name: 'Suối thần', text: 'Cuối lượt này, hủy một lá trong chồng bài bỏ hoặc vùng chơi.' },
  dragonEgg: { name: 'Trứng rồng', text: 'Đáng 3 điểm. Rồng càng nổi giận.' },
};
