function getElementsByIdPrefix(prefix) {
    let elements = document.querySelectorAll(`[id^="${prefix}"]`);
    let result = {};

    elements.forEach(el => {
        result[el.id] = el.innerHTML;
    });

    return result;
}

const texts = {};
texts.en = {
    "text0": "Lukas Thurner's Portfolio",
    "text1": "About Me",
    "text2": "Projects",
    "text3": "Contact",
    "text5": "DevOps Engineer and Data Scientist",
    "text6": "Contact",
    "text7": "About Me",
    "text8": "DevOps Engineer and <span class=\"red\">Data Scientist</span>",
    "text9": "I am a DevOps Engineer, Data Scientist, and Master of Computer Science. During my bachelor's studies, I specialized in networking, cryptology, and IT security. During my master's studies, I worked as a Data Scientist for WILO SE in Hof, where I also wrote my bachelor's and master's thesis in the field of SAP MES. I have several years of experience working with Linux servers as well as numerous programming languages and frameworks, including C/C++, Java, JUnit, C#, Assembler, Unity, PHP, JavaScript, Syncfusion, D3.js, SQL, PQL, MongoDB, HTML, CSS, and shell scripting. Additionally, I am a certified network administrator.",
    "text10": "Projects",
    "text11": "The Golden Egg",
    "text12": "A 3D jump 'n' run game. The game was developed by me and four fellow students in the summer semester of 2022. Since it was the best student project in a long time, the university decided to publish the game on Steam.<br><br>Languages: C#, Unity<br>Year: 2022",
    "text13": "When I worked as a Sysadmin for Yaver Infrastructure &amp; Services GmbH in 2020, I redesigned their website.<br><br>Languages: WordPress<br>Year: 2020",
    "text14": "A website that statistically analyzes data on natural disasters. During my master's studies, I additionally took a course in data visualization as an elective.<br><br>Languages: D3.js<br>Year: 2024",
    "text15": "3D Printing &amp; CAD",
    "text16": "A hobby of mine: I produce Art Deco objects using a 3D printer and CNC milling machine.<br><br>Tool: Tinker CAD<br>Year: 2019",
    "text17": "Image Gallery",
    "text18": "SAP MES Line Dashboard",
    "text19": "My bachelor's thesis: A dashboard that monitors the status of a production line in real time.<br><br>Languages: HTML, CSS, JS, Syncfusion, SQL, SAP Netweaver<br>Year: 2021",
    "text20": "Image Gallery",
    "text21": "SAP MES Capacity Dashboard",
    "text22": "My master's thesis: A series of web pages that visualize data from an SAP ERP and an SAP MES system to facilitate capacity planning.<br><br>Languages &amp; Tools: SQL, SAP Netweaver, JavaScript, Python, HTML, JS, CSS, Syncfusion<br>Year: 2024",
    "text23": "Image Gallery",
    "text24": "Certificates",
    "text25": "Master's Degree",
    "text26": "I completed my master's degree at the end of 2024. The certificate is currently still being printed.<br><br>University: HAW Hof<br>Year: 2024",
    "text27": "Work Certificate",
    "text28": "In summer 2019, I completed further training as a network technician via distance learning.<br><br>School: Fernschule Weber<br>Year: 2019",
    "text29": "Network Technician",
    "text30": "In summer 2019, I completed further training as a network technician via distance learning.<br><br>School: Fernschule Weber<br>Year: 2019",
    "text31": "Bachelor's Degree",
    "text32": "I completed my bachelor's degree in March 2023. In my bachelor's studies, I specialized in networking, cryptology, and IT security.<br><br>University: HAW Hof<br>Year: 2023",
    "text33": "Contact:",
    "text34": "Copyright © Lukas Thurner. All rights reserved.",
    "text_3d_0": "Slideshow",
    "text_3d_1": "A small Buddha statue",
    "text_3d_2": "The statue of liberty",
    "text_3d_3": "key chains",
    "text_workcenter_1":"Overview over the departments of a factory",
    "text_workcenter_2":"Overview over all workcenters within the assembly department",
    "text_workcenter_3":"Dashboard for a Workcenter",
    "text_kapa_1":"Meassuring how often the Frozen-Zone regulation inside the factory gets violated",
    "text_kapa_2":"Meassuring the best and worst performing production lines",
    "text_kapa_3":"Visualizing Supply and Workload on a weekly basis for various production lines",
    "text_kapa_4":"Meassuring lead times and value stream indexes for various production lines for various time periods",
    "text_kapa_5":"An SQL command I developed to meassure average value stream index and lead time for any group of production lines, for any number of days, weeks, months or years",
}


function changeLanguage(lang) {
    if(typeof lang !== 'string' || lang.length !== 2) throw new Error("Specify a language using a 2 letter code!!");
    document.documentElement.lang = lang;

    if(lang === 'en') {
        languageButton.onclick = () => {changeLanguage('de')};
        languageButton.innerHTML = "German Version";
    }
    if(lang === 'de') {
        languageButton.onclick = () => {changeLanguage('en')};
        languageButton.innerHTML = "English Version";
    }
    const keys = Object.keys(texts[lang]);
    for(key of keys) {
        const element = document.getElementById(key);
        if(element) element.innerHTML = texts[lang][key];
    }
}

document.addEventListener("DOMContentLoaded", initLang);
function initLang() {
    texts[document.documentElement.lang] = getElementsByIdPrefix('text');
    languageButton.onclick = () => {changeLanguage('en')};

    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if(lang) changeLanguage(lang);
}