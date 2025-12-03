:root {
--bg-color: #0d1117; /* 深黑背景 (GitHub dark) /
--card-bg: #161b22; / 卡片背景 /
--text-color: #c9d1d9; / 淺灰文字 /
--accent-color: #2f81f7; / 主要強調色 (藍色) /
--secondary-accent: #1e6fbf; / 次要強調色 /
--info-color: #798692; / 次要資訊文字顏色 /
--success-color: #2ea043; / 成功/正面顏色 */
}

/* 基本重置與字體設定 */

{
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
background-color: var(--bg-color);
color: var(--text-color);
line-height: 1.6;
min-height: 100vh;
}

/* 導航欄樣式 */
.navbar {
display: flex;
justify-content: space-between;
align-items: center;
padding: 20px 80px;
background-color: var(--bg-color);
border-bottom: 1px solid #1c232e;
position: sticky;
top: 0;
z-index: 1000;
}

.navbar .logo {
font-size: 24px;
font-weight: 700;
color: var(--accent-color);
letter-spacing: 1px;
}

.navbar nav a {
color: var(--info-color);
text-decoration: none;
margin-left: 25px;
font-weight: 500;
transition: color 0.3s;
}

.navbar nav a:hover {
color: var(--text-color);
}

/* 英雄區塊 (Hero Section) 樣式 /
.hero-section {
display: flex;
justify-content: space-between;
align-items: center;
padding: 80px;
min-height: calc(100vh - 61px); / 扣除 navbar 高度 */
}

.left-content {
max-width: 600px;
}

.greeting {
font-size: 16px;
color: var(--accent-color);
margin-bottom: 5px;
font-weight: 600;
}

.left-content h1 {
font-size: 72px;
font-weight: 900;
color: var(--text-color);
line-height: 1;
margin-bottom: 10px;
}

.info {
font-size: 18px;
color: var(--info-color);
margin-bottom: 15px;
}

.description {
font-size: 20px;
margin-bottom: 30px;
color: var(--text-color);
}

/* 按鈕樣式 /
.button-group {
margin-top: 30px;
display: flex;
gap: 15px; / 使用 gap 代替 margin-right */
}

.btn {
text-decoration: none;
padding: 12px 25px;
border-radius: 8px; /* 稍微圓潤的邊角 */
font-weight: bold;
transition: background-color 0.3s, transform 0.2s, box-shadow 0.3s;
display: inline-block;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn.primary {
background-color: var(--accent-color);
color: white;
border: none;
}

.btn.primary:hover {
background-color: var(--secondary-accent);
transform: translateY(-2px);
box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

.btn.secondary {
background-color: transparent;
color: var(--text-color);
border: 2px solid var(--info-color);
}

.btn.secondary:hover {
background-color: rgba(255, 255, 255, 0.05);
transform: translateY(-2px);
box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

/* 右側視覺樣式 */
.right-visual {
flex-shrink: 0;
}

.visual-placeholder {
width: 350px;
height: 350px;
border-radius: 50%; /* 模仿圓形頭像 */
background-image: linear-gradient(135deg, #1f2a38, #3e5068);
box-shadow: 0 0 0 10px var(--card-bg), 0 0 0 12px var(--accent-color);
display: flex;
justify-content: center;
align-items: center;
font-size: 24px;
font-weight: bold;
color: var(--text-color);
animation: pulse 3s infinite;
}

@keyframes pulse {
0% { transform: scale(1); }
50% { transform: scale(1.02); }
100% { transform: scale(1); }
}

/* 主要內容區塊樣式 */
section {
padding: 80px;
border-top: 1px solid #1c232e;
}

section h2 {
font-size: 40px;
margin-bottom: 40px;
text-align: center;
color: var(--text-color);
}

/* 技能區塊 */
.skills-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 30px;
}

.skill-card {
background-color: var(--card-bg);
padding: 25px;
border-radius: 10px;
box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
transition: transform 0.3s, box-shadow 0.3s;
}

.skill-card:hover {
transform: translateY(-5px);
box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.skill-card i {
font-size: 30px;
color: var(--accent-color);
margin-bottom: 10px;
}

.skill-card h3 {
font-size: 20px;
margin-bottom: 10px;
color: var(--text-color);
}

.skill-card p {
font-size: 16px;
color: var(--info-color);
}

/* 作品集區塊 */
.portfolio-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 30px;
}

.portfolio-item {
background-color: var(--card-bg);
border-radius: 10px;
overflow: hidden;
box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
transition: transform 0.3s, box-shadow 0.3s;
}

.portfolio-item:hover {
transform: translateY(-5px);
box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.placeholder-img {
width: 100%;
height: 200px;
background-image: linear-gradient(45deg, #2a3340, #3e5068);
display: flex;
justify-content: center;
align-items: center;
color: var(--info-color);
font-weight: bold;
}

.portfolio-content {
padding: 20px;
}

.portfolio-content h3 {
font-size: 20px;
margin-bottom: 10px;
}

.portfolio-content p {
color: var(--info-color);
margin-bottom: 15px;
}

.portfolio-content .btn {
padding: 8px 15px;
font-size: 14px;
}

/* 社群連結區塊 */
.social-links {
display: flex;
flex-direction: column;
align-items: center;
gap: 15px;
max-width: 500px;
margin: 0 auto;
}

.social-btn {
display: flex;
align-items: center;
justify-content: center;
width: 100%;
padding: 15px 20px;
background-color: var(--card-bg);
color: var(--text-color);
text-decoration: none;
border-radius: 8px;
font-weight: 600;
transition: background-color 0.3s, transform 0.2s;
box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.social-btn:hover {
background-color: #242933; /* 稍微亮一點的背景 */
transform: translateY(-2px);
}

.social-btn i {
font-size: 20px;
margin-right: 15px;
width: 25px; /* 確保圖標對齊 */
text-align: center;
}

/* 特定社群圖標顏色 (增加視覺效果) /
.social-btn .fa-youtube { color: #ff0000; }
.social-btn .fa-twitch { color: #9146ff; }
.social-btn .fa-tiktok { color: #69c9d0; }
.social-btn .fa-bilibili { color: #00a1d6; } / Bilibili 使用藍色，但 FontAwesome 沒有 bilibili 圖標，這裡使用 fa-play 代替 /
.social-btn .fa-x-twitter { color: #ffffff; } / X/Twitter /
.social-btn .fa-roblox { color: #00a2ff; }
.social-btn .fa-palette { color: #f7a63d; } / PENUP 畫板圖標 /
.social-btn .fa-facebook { color: #1877f2; }
.social-btn .fa-instagram { color: #e4405f; }
.social-btn .fa-discord { color: #5865f2; }
.social-btn .fa-envelope { color: var(--success-color); } / E-mail */
.social-btn .fa-line { color: #00c300; }

/* 聯絡表單區塊 */
.contact-form {
max-width: 600px;
margin: 0 auto;
background-color: var(--card-bg);
padding: 30px;
border-radius: 10px;
box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.form-group {
margin-bottom: 20px;
}

.form-group label {
display: block;
margin-bottom: 8px;
font-weight: 600;
}

.form-group input,
.form-group textarea {
width: 100%;
padding: 12px;
border: 1px solid #30363d;
background-color: #0d1117;
color: var(--text-color);
border-radius: 6px;
font-size: 16px;
transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
border-color: var(--accent-color);
outline: none;
}

.form-group textarea {
resize: vertical;
min-height: 150px;
}

.submit-btn {
width: 100%;
background-color: var(--success-color);
color: white;
padding: 15px;
border: none;
border-radius: 8px;
font-size: 18px;
font-weight: bold;
cursor: pointer;
transition: background-color 0.3s, transform 0.2s;
}

.submit-btn:hover {
background-color: #218635;
transform: translateY(-1px);
}

/* 倒數計時器樣式 */
.countdown-box {
margin-top: 20px;
padding: 15px;
background-color: var(--card-bg);
border-radius: 8px;
text-align: center;
border-left: 5px solid var(--accent-color);
}

.countdown-box p {
margin-bottom: 10px;
font-weight: 600;
}

#countdown {
font-size: 24px;
font-weight: bold;
color: var(--accent-color);
display: flex;
justify-content: center;
gap: 15px;
}

.time-unit span {
display: block;
font-size: 14px;
font-weight: normal;
color: var(--info-color);
margin-top: 5px;
}

/* 頁腳樣式 */
footer {
padding: 30px 80px;
text-align: center;
border-top: 1px solid #1c232e;
color: var(--info-color);
font-size: 14px;
margin-top: 50px;
}

/* 響應式設計 */
@media (max-width: 1024px) {
.navbar, section, footer {
padding: 20px 40px;
}

.hero-section {
    flex-direction: column;
    text-align: center;
    padding: 60px 40px;
}

.right-visual {
    margin-top: 40px;
    margin-bottom: 20px;
}

.left-content {
    max-width: 100%;
}

.left-content h1 {
    font-size: 60px;
}

.description {
    font-size: 18px;
}

.button-group {
    justify-content: center;
}

.visual-placeholder {
    width: 300px;
    height: 300px;
}

.portfolio-grid {
    grid-template-columns: 1fr;
}


}

@media (max-width: 600px) {
.navbar {
flex-direction: column;
align-items: flex-start;
padding: 15px 20px;
}

.navbar nav {
    margin-top: 10px;
}

.navbar nav a {
    margin-left: 0;
    margin-right: 15px;
    font-size: 14px;
}

.hero-section {
    padding: 40px 20px;
}

.left-content h1 {
    font-size: 48px;
}

.button-group {
    flex-direction: column;
    gap: 10px;
}

.btn {
    width: 100%;
    text-align: center;
}

.visual-placeholder {
    width: 250px;
    height: 250px;
    font-size: 20px;
}

section {
    padding: 40px 20px;
}

section h2 {
    font-size: 32px;
}


}