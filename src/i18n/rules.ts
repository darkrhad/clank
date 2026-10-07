// The rules as players read them in the game (Rules button), written for this
// game in our own words and terms. Symbol tags as on the cards: {skill:2},
// {gold:1}, {points:5}, {sword}, {boot}, {heart}. Numbers match engine/setup.ts.

import type { Lang } from './lang';

export interface RuleSection { title: string; items: string[] }

const EN: RuleSection[] = [
  { title: 'The goal', items: [
    'Sneak into the citadel, steal a Treasure (Artifact) from the Depths and get out alive.',
    'Every noise you make draws the dragon. Whoever escapes with the richest haul wins.',
  ] },
  { title: 'Your turn', items: [
    'You hold 5 cards. Play them all, in any order. They give {skill:1} Skill, {sword} Swords, {boot} Boots, {gold:1} Gold and other effects.',
    'Spend Skill to buy cards from the Dungeon Row or the Reserve. Bought cards go to your discard pile and come back in later hands: your deck gets stronger.',
    'Spend Swords to defeat monsters in the Row, or the Forest Imp, which never leaves.',
    'Spend Boots to walk through tunnels.',
    'At the end of your turn, all played cards go to your discard pile and you draw 5 new ones. Empty spaces in the Dungeon Row are refilled.',
  ] },
  { title: 'Moving', items: [
    'Each tunnel costs one {boot}. A tunnel with footprints costs two.',
    'A monster mark in a tunnel deals 1 damage {heart} when you pass. Each Sword you use blocks 1.',
    'A lock needs a Master Key. An arrow is one way only.',
    'Entering a Crystal Cave ends your walking for this turn.',
    'A Fountain heals 1 when you step in.',
    'The lower half of the board is the Depths. Some cards can only be used there.',
  ] },
  { title: 'Treasures and secrets', items: [
    'When you enter a room you may take one thing lying there.',
    'Treasures (Artifacts) are worth their number in points. You can carry one, two with a Backpack. Each one you take makes the dragon angrier.',
    'Secrets are hidden until taken: Gold, Skill, cards, potions and more.',
    'In a Market you can buy a Master Key, a Backpack or a Crown for {gold:7}.',
  ] },
  { title: 'Loảng xoảng! and the dragon', items: [
    'Noise is called Loảng xoảng!. Each point of it puts one of your cubes in the Loảng xoảng! area. Minus Loảng xoảng! takes cubes back.',
    'When a card with the dragon symbol appears in the Dungeon Row, the dragon attacks: all cubes in the area go into the bag, then cubes are drawn from it.',
    'Each of your cubes drawn is 1 damage to you. Black cubes are harmless.',
    'The angrier the dragon, the more cubes it draws. DANGER cards in the Row add one more.',
  ] },
  { title: 'Health and escaping', items: [
    'You have 10 health. At 10 damage you are knocked out.',
    'Knocked out above ground with a Treasure: the villagers rescue you and you still score. Knocked out in the Depths, or without a Treasure: you lose.',
    'To escape, walk out through the entrance gate (top left of the board) while carrying a Treasure.',
    'Only escaping earns the Mastery badge, worth {points:20}. Being rescued does not.',
    'The first player out starts the countdown: each round the dragon attacks harder, and on the fifth space everyone still inside is knocked out.',
  ] },
  { title: 'Scoring', items: [
    'Treasures, Crowns, Monkey Idols, Master Keys and Backpacks, the Mastery badge, each Gold, and the points on your cards ({points:2}).',
    'Highest total wins. On a tie, the most valuable Treasure wins.',
  ] },
];

const VI: RuleSection[] = [
  { title: 'Mục tiêu', items: [
    'Lẻn vào kinh thành, trộm một Bảo vật ở Tầng sâu rồi thoát ra an toàn.',
    'Mỗi tiếng động bạn gây ra đều đánh thức con rồng. Ai thoát ra với nhiều của cải nhất sẽ thắng.',
  ] },
  { title: 'Lượt của bạn', items: [
    'Bạn có 5 lá trên tay. Hãy chơi hết, theo thứ tự tùy ý. Chúng cho {skill:1} Kỹ năng, {sword} Kiếm, {boot} Giày, {gold:1} Vàng và các hiệu ứng khác.',
    'Dùng Kỹ năng để mua lá từ Hàng hầm ngục hoặc Dự trữ. Lá đã mua vào chồng bài bỏ và sẽ quay lại tay bạn sau: bộ bài của bạn mạnh dần lên.',
    'Dùng Kiếm để đánh bại quái vật trong Hàng, hoặc Ma rừng, kẻ không bao giờ rời đi.',
    'Dùng Giày để đi qua đường hầm.',
    'Cuối lượt, mọi lá đã chơi vào chồng bài bỏ và bạn rút 5 lá mới. Các ô trống trong Hàng hầm ngục được lấp đầy.',
  ] },
  { title: 'Di chuyển', items: [
    'Mỗi đường hầm tốn một {boot}. Đường hầm có dấu chân tốn hai.',
    'Mỗi dấu quái vật trong đường hầm gây 1 sát thương {heart} khi bạn đi qua. Mỗi Kiếm bạn dùng chặn được 1.',
    'Ổ khóa cần Chìa khóa vạn năng. Mũi tên là đường một chiều.',
    'Bước vào Hang pha lê thì lượt này không đi tiếp được nữa.',
    'Suối hồi phục hồi 1 máu khi bạn bước vào.',
    'Nửa dưới bàn chơi là Tầng sâu. Có những lá chỉ dùng được ở đó.',
  ] },
  { title: 'Bảo vật và bí mật', items: [
    'Mỗi lần vào một phòng, bạn được lấy một vật ở đó.',
    'Bảo vật đáng số điểm ghi trên nó. Bạn mang được một, có Ba lô thì hai. Mỗi lần lấy, rồng càng nổi giận.',
    'Bí mật được úp cho tới khi lấy: Vàng, Kỹ năng, lá bài, thuốc và nhiều thứ khác.',
    'Ở Chợ bạn có thể mua Chìa khóa vạn năng, Ba lô hoặc Vương miện với giá {gold:7}.',
  ] },
  { title: 'Loảng xoảng! và con rồng', items: [
    'Tiếng ồn gọi là Loảng xoảng!. Mỗi điểm đặt một khối của bạn vào vùng Loảng xoảng!. Loảng xoảng! âm thì lấy khối về.',
    'Khi một lá có biểu tượng rồng xuất hiện trong Hàng hầm ngục, rồng tấn công: mọi khối trong vùng vào túi, rồi rút khối ra từ túi.',
    'Mỗi khối của bạn bị rút là 1 sát thương. Khối đen thì vô hại.',
    'Rồng càng giận càng rút nhiều khối. Lá NGUY HIỂM trong Hàng khiến rồng rút thêm một.',
  ] },
  { title: 'Máu và thoát ra', items: [
    'Bạn có 10 máu. Nhận đủ 10 sát thương là bị hạ gục.',
    'Bị hạ gục trên mặt đất khi có Bảo vật: dân làng cứu bạn và bạn vẫn được tính điểm. Bị hạ gục ở Tầng sâu, hoặc khi chưa có Bảo vật: bạn thua.',
    'Muốn thoát, hãy đi ra qua cổng vào (góc trên bên trái bàn chơi) khi đang mang Bảo vật.',
    'Chỉ khi tự thoát ra mới được Huy hiệu Bậc thầy, đáng {points:20}. Được dân làng cứu thì không có.',
    'Người ra đầu tiên bắt đầu đếm ngược: mỗi vòng rồng tấn công mạnh hơn, đến ô thứ năm thì ai còn bên trong đều bị hạ gục.',
  ] },
  { title: 'Tính điểm', items: [
    'Bảo vật, Vương miện, Tượng khỉ, Chìa khóa vạn năng và Ba lô, Huy hiệu Bậc thầy, mỗi Vàng, và điểm trên các lá bài của bạn ({points:2}).',
    'Tổng cao nhất thắng. Nếu hòa, ai có Bảo vật giá trị nhất thắng.',
  ] },
];

export const RULES: Record<Lang, RuleSection[]> = { en: EN, vi: VI };
