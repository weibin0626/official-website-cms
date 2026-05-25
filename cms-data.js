/**
 * CMS 数据初始化文件
 * 统一数据结构：sites 数组 + 全局 users 数组
 * 提供 localStorage 读写工具函数
 */

// ============================================================
// 默认站点数据
// ============================================================
var DEFAULT_DATA = {
  currentSiteId: 'site_001',
  sites: [
    {
      id: 'site_001',
      name: '春阳教育集团',
      nameEn: 'Chunyang Education Group',
      primaryColor: '#1a3a6b',
      secondaryColor: '#c8a45c',
      logo: 'https://cdn-icons-png.flaticon.com/512/3190/3190596.png',
      phone: '400-888-6688',
      email: 'info@chunyang.edu.cn',
      address: '江苏省南京市玄武区教育路188号',
      icp: '苏ICP备2024001234号',
      police: '苏公网安备 32010202000123号',
      description: '春阳教育集团成立于1998年，是一所以高品质基础教育为核心，集学前教育、义务教育、高中教育于一体的综合性教育集团。集团秉承"厚德博学、求实创新"的办学理念，致力于培养德智体美劳全面发展的社会主义建设者和接班人。',
      navItems: [
        { id: 'nav_001', name: '首页', link: '#home', children: [] },
        { id: 'nav_002', name: '学校要闻', link: '#news', children: [
          { id: 'nav_002_1', name: '校园新闻', link: '#news-campus' },
          { id: 'nav_002_2', name: '通知公告', link: '#news-notice' },
          { id: 'nav_002_3', name: '媒体聚焦', link: '#news-media' }
        ]},
        { id: 'nav_003', name: '关于我们', link: '#about', children: [
          { id: 'nav_003_1', name: '学校简介', link: '#about-intro' },
          { id: 'nav_003_2', name: '办学理念', link: '#about-philosophy' },
          { id: 'nav_003_3', name: '校园风光', link: '#about-gallery' }
        ]},
        { id: 'nav_004', name: '组织架构', link: '#organization', children: [
          { id: 'nav_004_1', name: '领导班子', link: '#org-leadership' },
          { id: 'nav_004_2', name: '部门设置', link: '#org-departments' }
        ]},
        { id: 'nav_005', name: '师资队伍', link: '#teachers', children: [
          { id: 'nav_005_1', name: '特级教师', link: '#teachers-special' },
          { id: 'nav_005_2', name: '学科带头人', link: '#teachers-leaders' }
        ]},
        { id: 'nav_006', name: '教学资源', link: '#resources', children: [] },
        { id: 'nav_007', name: '招生信息', link: '#admission', children: [
          { id: 'nav_007_1', name: '招生简章', link: '#adm-guide' },
          { id: 'nav_007_2', name: '在线报名', link: '#adm-register' }
        ]},
        { id: 'nav_008', name: '联系我们', link: '#contact', children: [] }
      ],
      banners: [
        { id: 'banner_001', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&h=500&fit=crop', title: '砥砺奋进三十载，春阳教育谱新篇', subtitle: '开创教育新未来', link: '#' },
        { id: 'banner_002', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&h=500&fit=crop', title: '2026年度工作会议圆满召开', subtitle: '携手共进，砥砺前行', link: '#' },
        { id: 'banner_003', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1400&h=500&fit=crop', title: '携手共进，共创教育新未来', subtitle: '厚德博学，求实创新', link: '#' }
      ],
      quickLinks: [
        { id: 'ql_001', name: '招生咨询', icon: 'fa-headset', link: '#consult', color: '#3b82f6' },
        { id: 'ql_002', name: '在线报名', icon: 'fa-pen-to-square', link: '#register', color: '#10b981' },
        { id: 'ql_003', name: '资料下载', icon: 'fa-download', link: '#download', color: '#f59e0b' },
        { id: 'ql_004', name: '联系我们', icon: 'fa-envelope', link: '#contact', color: '#8b5cf6' }
      ],
      news: [
        { id: 'n_001', title: '我校在全市教育质量评估中荣获一等奖', category: '集团动态', date: '2026-05-20', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop', summary: '在2026年度全市教育质量综合评估中，我校凭借优异的教学质量和办学成果，荣获一等奖殊荣。', status: 'published' },
        { id: 'n_002', title: '春阳教育集团2026年度工作会议圆满召开', category: '集团动态', date: '2026-05-15', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=250&fit=crop', summary: '5月15日，春阳教育集团2026年度工作会议在集团总部大礼堂隆重召开。', status: 'published' },
        { id: 'n_003', title: '我校与武汉大学签署战略合作协议', category: '合作交流', date: '2026-05-10', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=250&fit=crop', summary: '近日，我校与武汉大学正式签署战略合作协议，双方将在人才培养等领域开展深度合作。', status: 'published' },
        { id: 'n_004', title: '2026年春季招生简章正式发布', category: '招生信息', date: '2026-05-01', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=250&fit=crop', summary: '春阳教育集团2026年春季招生简章已正式发布，涵盖小学、初中、高中各学段。', status: 'published' },
        { id: 'n_005', title: '学校高考喜报：本科上线率达98.5%', category: '教学成果', date: '2026-04-25', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop', summary: '2026年高考成绩揭晓，我校本科上线率再创新高，达到98.5%。', status: 'published' }
      ],
      announcements: [
        { id: 'ann_001', title: '关于2026年暑期补课安排的通知', date: '2026-05-18' },
        { id: 'ann_002', title: '2026年教师招聘公告', date: '2026-05-12' },
        { id: 'ann_003', title: '关于开展"五一"期间安全教育的通知', date: '2026-04-28' }
      ],
      teachers: [
        { id: 't_001', name: '张明远', title: '语文特级教师', subject: '语文', years: 28, photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face', bio: '江苏省语文特级教师，全国模范教师，享受国务院特殊津贴专家。' },
        { id: 't_002', name: '李淑华', title: '数学学科带头人', subject: '数学', years: 22, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face', bio: '南京市数学学科带头人，省级优秀课评比一等奖获得者。' },
        { id: 't_003', name: '王建国', title: '英语高级教师', subject: '英语', years: 18, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', bio: '高级教师，英语教研组组长，多次指导学生获全国英语竞赛金奖。' },
        { id: 't_004', name: '陈晓燕', title: '物理骨干教师', subject: '物理', years: 15, photo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&h=300&fit=crop&crop=face', bio: '市级骨干教师，物理创新实验教学法创始人。' }
      ],
      leaders: [
        { id: 'l_001', name: '张明远', position: '董事长', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=400&fit=crop&crop=face', bio: '春阳教育集团创始人，从事教育事业三十余年，全国优秀教育工作者。' },
        { id: 'l_002', name: '刘志强', position: '校长', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face', bio: '教育学博士，正高级教师，曾任省重点中学校长十五年。' },
        { id: 'l_003', name: '赵秀芳', position: '副校长', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop&crop=face', bio: '教育管理硕士，主管教学与科研工作，省级名校长工作室成员。' },
        { id: 'l_004', name: '孙伟民', position: '副校长', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop&crop=face', bio: '主管行政与后勤工作，三十年教育管理经验。' }
      ],
      friendLinks: [
        { id: 'fl_001', name: '教育部', url: 'http://www.moe.gov.cn' },
        { id: 'fl_002', name: '江苏省教育厅', url: 'http://jyt.jiangsu.gov.cn' },
        { id: 'fl_003', name: '南京市教育局', url: 'http://edu.nanjing.gov.cn' },
        { id: 'fl_004', name: '中国教育在线', url: 'https://www.eol.cn' },
        { id: 'fl_005', name: '学信网', url: 'https://www.chsi.com.cn' }
      ],
      stats: { visits: 125680, users: 3200, articles: 156 }
    },
    {
      id: 'site_002',
      name: '德育中学',
      nameEn: 'Deyu Middle School',
      primaryColor: '#1a6b3a',
      secondaryColor: '#c8a45c',
      logo: 'https://cdn-icons-png.flaticon.com/512/2995/2995459.png',
      phone: '025-87654321',
      email: 'info@deyu.edu.cn',
      address: '江苏省南京市鼓楼区德育路66号',
      icp: '苏ICP备2024005678号',
      police: '苏公网安备 32010202000456号',
      description: '德育中学创建于1956年，是一所具有深厚文化底蕴的省级示范性中学。学校坚持"以德立校、以德立人"的办学方针，培养了一大批品学兼优的社会栋梁。',
      navItems: [
        { id: 'nav_001', name: '首页', link: '#home', children: [] },
        { id: 'nav_002', name: '学校要闻', link: '#news', children: [
          { id: 'nav_002_1', name: '校园新闻', link: '#news-campus' },
          { id: 'nav_002_2', name: '通知公告', link: '#news-notice' }
        ]},
        { id: 'nav_003', name: '关于我们', link: '#about', children: [] },
        { id: 'nav_004', name: '师资队伍', link: '#teachers', children: [] },
        { id: 'nav_005', name: '招生信息', link: '#admission', children: [] },
        { id: 'nav_006', name: '联系我们', link: '#contact', children: [] }
      ],
      banners: [
        { id: 'banner_001', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&h=500&fit=crop', title: '德育中学欢迎您', subtitle: '以德立校 以德立人', link: '#' },
        { id: 'banner_002', image: 'https://images.unsplash.com/photo-1497633762265-9d179a9903d7?w=1400&h=500&fit=crop', title: '追求卓越 知行合一', subtitle: '省级示范性中学', link: '#' }
      ],
      quickLinks: [
        { id: 'ql_001', name: '招生咨询', icon: 'fa-headset', link: '#consult', color: '#1a6b3a' },
        { id: 'ql_002', name: '在线报名', icon: 'fa-pen-to-square', link: '#register', color: '#3b82f6' },
        { id: 'ql_003', name: '资料下载', icon: 'fa-download', link: '#download', color: '#f59e0b' },
        { id: 'ql_004', name: '联系我们', icon: 'fa-envelope', link: '#contact', color: '#8b5cf6' }
      ],
      news: [
        { id: 'n_001', title: '德育中学科技节盛大开幕', category: '校园动态', date: '2026-05-10', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop', summary: '我校一年一度的科技节活动于5月10日正式拉开帷幕。', status: 'published' },
        { id: 'n_002', title: '我校教师在市级教学比赛中获佳绩', category: '师资荣誉', date: '2026-05-08', image: 'https://images.unsplash.com/photo-1497633762265-9d179a9903d7?w=400&h=250&fit=crop', summary: '我校5名教师获市教学大赛特等奖。', status: 'published' },
        { id: 'n_003', title: '学校通过省级示范校复查', category: '学校荣誉', date: '2026-04-20', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop', summary: '经过严格的复查评估，德育中学顺利通过省级示范校复查。', status: 'published' }
      ],
      announcements: [
        { id: 'ann_001', title: '关于夏季作息时间调整的通知', date: '2026-05-15' },
        { id: 'ann_002', title: '2026年秋季招生计划公告', date: '2026-05-01' }
      ],
      teachers: [
        { id: 't_001', name: '周立人', title: '语文高级教师', subject: '语文', years: 20, photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face', bio: '中学高级教师，语文教研组组长。' },
        { id: 't_002', name: '钱秀英', title: '数学特级教师', subject: '数学', years: 25, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face', bio: '省级特级教师，曾获全国优秀课评比一等奖。' }
      ],
      leaders: [
        { id: 'l_001', name: '周志远', position: '校长', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=400&fit=crop&crop=face', bio: '教育学硕士，正高级教师。' },
        { id: 'l_002', name: '马秀英', position: '副校长', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop&crop=face', bio: '主管教学副校长。' }
      ],
      friendLinks: [
        { id: 'fl_001', name: '教育部', url: 'http://www.moe.gov.cn' },
        { id: 'fl_002', name: '江苏省教育厅', url: 'http://jyt.jiangsu.gov.cn' },
        { id: 'fl_003', name: '中国教育在线', url: 'https://www.eol.cn' }
      ],
      stats: { visits: 58200, users: 860, articles: 72 }
    },
    {
      id: 'site_003',
      name: '明德职业学校',
      nameEn: 'Mingde Vocational School',
      primaryColor: '#6b1a1a',
      secondaryColor: '#c8a45c',
      logo: 'https://cdn-icons-png.flaticon.com/512/3190/3190596.png',
      phone: '025-11223344',
      email: 'info@mingde.edu.cn',
      address: '江苏省南京市江宁区明德路99号',
      icp: '苏ICP备2024009012号',
      police: '苏公网安备 32010202000789号',
      description: '明德职业学校是一所专注于职业教育与产业对接的现代化职业学校。学校秉承"明德精技、知行合一"的校训，致力于培养高素质技术技能人才，为区域经济社会发展提供有力支撑。',
      navItems: [
        { id: 'nav_001', name: '首页', link: '#home', children: [] },
        { id: 'nav_002', name: '学校要闻', link: '#news', children: [
          { id: 'nav_002_1', name: '校园动态', link: '#news-campus' },
          { id: 'nav_002_2', name: '通知公告', link: '#news-notice' }
        ]},
        { id: 'nav_003', name: '专业设置', link: '#majors', children: [
          { id: 'nav_003_1', name: '信息技术', link: '#major-it' },
          { id: 'nav_003_2', name: '机电工程', link: '#major-mech' },
          { id: 'nav_003_3', name: '财经商贸', link: '#major-biz' }
        ]},
        { id: 'nav_004', name: '招生就业', link: '#admission', children: [
          { id: 'nav_004_1', name: '招生简章', link: '#adm-guide' },
          { id: 'nav_004_2', name: '就业指导', link: '#adm-career' }
        ]},
        { id: 'nav_005', name: '联系我们', link: '#contact', children: [] }
      ],
      banners: [
        { id: 'banner_001', image: 'https://images.unsplash.com/photo-1517245386801-bb38db3752fc?w=1400&h=500&fit=crop', title: '明德精技 知行合一', subtitle: '培养高素质技术技能人才', link: '#' },
        { id: 'banner_002', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&h=500&fit=crop', title: '产教融合 校企合作', subtitle: '对接产业需求，服务区域发展', link: '#' }
      ],
      quickLinks: [
        { id: 'ql_001', name: '招生咨询', icon: 'fa-headset', link: '#consult', color: '#6b1a1a' },
        { id: 'ql_002', name: '在线报名', icon: 'fa-pen-to-square', link: '#register', color: '#3b82f6' },
        { id: 'ql_003', name: '就业服务', icon: 'fa-briefcase', link: '#career', color: '#f59e0b' },
        { id: 'ql_004', name: '联系我们', icon: 'fa-envelope', link: '#contact', color: '#8b5cf6' }
      ],
      news: [
        { id: 'n_001', title: '明德职校与华为签署校企合作协议', category: '校企合作', date: '2026-05-12', image: 'https://images.unsplash.com/photo-1517245386801-bb38db3752fc?w=400&h=250&fit=crop', summary: '我校与华为技术有限公司签署深度校企合作框架协议。', status: 'published' },
        { id: 'n_002', title: '2026年职业技能大赛喜获多项金奖', category: '竞赛成果', date: '2026-04-28', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop', summary: '我校学生在2026年全国职业技能大赛中喜获3金5银。', status: 'published' }
      ],
      announcements: [
        { id: 'ann_001', title: '2026年秋季招生报名开始', date: '2026-05-10' },
        { id: 'ann_002', title: '校园开放日活动通知', date: '2026-04-25' }
      ],
      teachers: [
        { id: 't_001', name: '王大伟', title: '高级工程师', subject: '信息技术', years: 15, photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face', bio: '高级工程师，信息技术专业带头人。' }
      ],
      leaders: [
        { id: 'l_001', name: '李德明', position: '校长', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=400&fit=crop&crop=face', bio: '职业教育专家，省级名校长。' }
      ],
      friendLinks: [
        { id: 'fl_001', name: '教育部', url: 'http://www.moe.gov.cn' },
        { id: 'fl_002', name: '江苏省教育厅', url: 'http://jyt.jiangsu.gov.cn' }
      ],
      stats: { visits: 32100, users: 520, articles: 45 }
    }
  ],
  // 全局用户（跨站点）
  users: [
    { id: 'u_001', username: 'admin', password: 'admin123', role: '超级管理员', status: 'active', lastLogin: '2026-05-25' },
    { id: 'u_002', username: 'editor', password: 'editor123', role: '内容编辑', status: 'active', lastLogin: '2026-05-24' },
    { id: 'u_003', username: 'viewer', password: 'viewer123', role: '只读用户', status: 'disabled', lastLogin: '-' }
  ]
};

// ============================================================
// localStorage 读写工具函数
// ============================================================
var STORAGE_KEY = 'cms_site_data';

/**
 * 初始化 CMS 数据：首次加载时写入默认数据
 */
function initCMSData() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
  }
}

/**
 * 获取全部 CMS 数据
 * @returns {Object} { currentSiteId, sites:[], users:[] }
 */
function getCMSData() {
  var raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    initCMSData();
    raw = localStorage.getItem(STORAGE_KEY);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('CMS数据解析失败，将重置为默认数据', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

/**
 * 保存全部 CMS 数据
 * @param {Object} data - 完整数据对象
 */
function saveCMSData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 获取当前激活的站点ID
 * @returns {string}
 */
function getCurrentSiteId() {
  var data = getCMSData();
  return data.currentSiteId || (data.sites[0] && data.sites[0].id) || 'site_001';
}

/**
 * 设置当前激活的站点ID
 * @param {string} siteId
 */
function setCurrentSiteId(siteId) {
  var data = getCMSData();
  data.currentSiteId = siteId;
  saveCMSData(data);
}

/**
 * 获取当前激活站点的完整数据
 * @returns {Object|null}
 */
function getCurrentSiteData() {
  var data = getCMSData();
  var siteId = data.currentSiteId;
  var site = null;
  for (var i = 0; i < data.sites.length; i++) {
    if (data.sites[i].id === siteId) {
      site = data.sites[i];
      break;
    }
  }
  return site || data.sites[0] || null;
}
