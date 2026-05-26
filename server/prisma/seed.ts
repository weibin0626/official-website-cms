import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'SUPER_ADMIN' }, update: {}, create: { name: 'SUPER_ADMIN', displayName: '超级管理员', description: '系统最高权限', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'SITE_ADMIN' }, update: {}, create: { name: 'SITE_ADMIN', displayName: '站点管理员', description: '站点管理权限', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'EDITOR' }, update: {}, create: { name: 'EDITOR', displayName: '内容编辑', description: '内容编辑权限', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'REVIEWER' }, update: {}, create: { name: 'REVIEWER', displayName: '审核员', description: '内容审核权限', isSystem: true } }),
    prisma.role.upsert({ where: { name: 'VIEWER' }, update: {}, create: { name: 'VIEWER', displayName: '只读用户', description: '只读权限', isSystem: true } }),
  ]);
  console.log('✅ Roles created');

  const sites = await Promise.all([
    prisma.site.upsert({ where: { name: 'site_001' }, update: {}, create: { name: 'site_001', nameCn: '春阳教育集团', nameEn: 'Chunyang Education Group', primaryColor: '#1a3a6b', phone: '400-888-6688', address: '江苏省南京市玄武区教育路188号', icp: '苏ICP备2024001234号', status: 'ACTIVE' } }),
    prisma.site.upsert({ where: { name: 'site_002' }, update: {}, create: { name: 'site_002', nameCn: '德育中学', primaryColor: '#1a6b3a', status: 'ACTIVE' } }),
    prisma.site.upsert({ where: { name: 'site_003' }, update: {}, create: { name: 'site_003', nameCn: '明德职业学校', primaryColor: '#6b1a1a', status: 'ACTIVE' } }),
  ]);
  console.log('✅ Sites created');

  const hashedPwd = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPwd, email: 'admin@cms.local', realName: '系统管理员', isActive: true, isGlobal: true },
  });
  console.log('✅ Admin user created');

  const superRole = roles.find(r => r.name === 'SUPER_ADMIN')!;
  for (const site of sites) {
    await prisma.siteUser.upsert({
      where: { siteId_userId: { siteId: site.id, userId: admin.id } },
      update: {},
      create: { siteId: site.id, userId: admin.id, roleId: superRole.id, isDefault: site.name === 'site_001' },
    });
  }
  console.log('✅ Site user associations created');

  const site1 = sites[0];
  await prisma.banner.createMany({ data: [
    { siteId: site1.id, title: '春阳教育集团欢迎您', imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop', sort: 1 },
    { siteId: site1.id, title: '全力打造优质教育品牌', imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop', sort: 2 },
    { siteId: site1.id, title: '培育新时代优秀人才', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop', sort: 3 },
  ]});

  await prisma.quickLink.createMany({ data: [
    { siteId: site1.id, name: '招生咨询', url: '/enrollment', icon: 'school', sort: 1 },
    { siteId: site1.id, name: '在线报名', url: '/apply', icon: 'edit', sort: 2 },
    { siteId: site1.id, name: '资料下载', url: '/downloads', icon: 'download', sort: 3 },
    { siteId: site1.id, name: '联系我们', url: '/contact', icon: 'phone', sort: 4 },
  ]});

  await prisma.friendLink.createMany({ data: [
    { siteId: site1.id, name: '教育部', url: 'http://www.moe.gov.cn', sort: 1 },
    { siteId: site1.id, name: '中国教育在线', url: 'https://www.eol.cn', sort: 2 },
  ]});

  const nav1 = await prisma.navItem.create({ data: { siteId: site1.id, name: '首页', url: '/', sort: 1 } });
  const nav2 = await prisma.navItem.create({ data: { siteId: site1.id, name: '学校要闻', url: '/news', sort: 2 } });
  await prisma.navItem.createMany({ data: [
    { siteId: site1.id, parentId: nav2.id, name: '校园新闻', url: '/news/campus', sort: 1 },
    { siteId: site1.id, parentId: nav2.id, name: '通知公告', url: '/news/notice', sort: 2 },
    { siteId: site1.id, name: '关于我们', url: '/about', sort: 3 },
    { siteId: site1.id, name: '师资队伍', url: '/teachers', sort: 4 },
    { siteId: site1.id, name: '招生信息', url: '/enrollment', sort: 5 },
    { siteId: site1.id, name: '联系我们', url: '/contact', sort: 6 },
  ] });
  // suppress unused var warning
  void nav1;

  await prisma.leader.createMany({ data: [
    { siteId: site1.id, name: '王大明', position: '校长', photo: 'https://i.pravatar.cc/200?img=1', bio: '教育学博士，从事教育工作30余年。', sort: 1 },
    { siteId: site1.id, name: '李秀英', position: '党委书记', photo: 'https://i.pravatar.cc/200?img=5', bio: '从事党政工作25年。', sort: 2 },
  ]});

  await prisma.teacher.createMany({ data: [
    { siteId: site1.id, name: '张明远', title: '特级教师', subject: '语文', years: 28, photo: 'https://i.pravatar.cc/200?img=10', bio: '从教28年，省市优秀教师。', sort: 1 },
    { siteId: site1.id, name: '李淑华', title: '学科带头人', subject: '数学', years: 22, photo: 'https://i.pravatar.cc/200?img=11', bio: '数学教育专家。', sort: 2 },
    { siteId: site1.id, name: '王建国', title: '高级教师', subject: '英语', years: 18, photo: 'https://i.pravatar.cc/200?img=12', bio: '留美归来英语教师。', sort: 3 },
    { siteId: site1.id, name: '陈晓燕', title: '骨干教师', subject: '物理', years: 15, photo: 'https://i.pravatar.cc/200?img=9', bio: '物理教学创新先锋。', sort: 4 },
  ]});

  await prisma.article.createMany({ data: [
    { siteId: site1.id, title: '我校在全市教育质量评估中荣获一等奖', content: '近日，在全市教育质量综合评估中，我校凭借优异的教学成果荣获一等奖...', status: 'PUBLISHED', publishedAt: new Date('2026-05-20') },
    { siteId: site1.id, title: '春阳教育集团2026年度工作会议圆满召开', content: '5月15日，春阳教育集团2026年度工作会议在集团总部召开...', status: 'PUBLISHED', publishedAt: new Date('2026-05-15') },
    { siteId: site1.id, title: '我校与武汉大学签署战略合作协议', content: '为深化产学研合作，我校与武汉大学正式签署战略合作协议...', status: 'PUBLISHED', publishedAt: new Date('2026-05-10') },
    { siteId: site1.id, title: '2026年春季招生简章正式发布', content: '2026年春季招生工作即将开始，现将招生简章发布如下...', status: 'PUBLISHED', publishedAt: new Date('2026-05-01') },
    { siteId: site1.id, title: '学校高考喜报：本科上线率达98.5%', content: '今年高考成绩揭榜，我校再创佳绩，本科上线率高达98.5%...', status: 'PUBLISHED', publishedAt: new Date('2026-04-25') },
  ]});

  console.log('✅ Sample data for site_001 created');
  console.log('🎉 Seeding complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
