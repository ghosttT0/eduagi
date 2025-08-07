import type { ThemeConfig } from 'antd';

export const adminTheme: ThemeConfig = {
  token: {
    // 核心颜色
    colorPrimary: '#7B68EE', // 参考图片中的紫色
    colorInfo: '#7B68EE',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',

    // 背景颜色
    colorBgLayout: '#F8F9FA',    // 主背景的浅灰色
    colorBgContainer: '#FFFFFF', // 卡片、输入框、头部等的纯白色
    colorBgElevated: '#FFFFFF',  // 浮动元素的背景色

    // 尺寸和间距
    borderRadius: 12,           // 所有组件的圆角
    controlHeight: 40,          // 更高的按钮和输入框
    padding: 16,
    margin: 16,

    // 字体
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    lineHeight: 1.5715,

    // 阴影
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.06)',

    // 边框
    colorBorder: '#F0F0F0',
    colorBorderSecondary: '#F5F5F5',
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',        // 白色侧边栏
      headerPadding: '0 24px',
      headerHeight: 72,
      bodyBg: '#F8F9FA',
    },
    Menu: {
      itemColor: '#2c2c2c',         // 菜单项的深色文字，更清晰
      itemHoverColor: '#7B68EE',    // 悬停时的紫色
      itemSelectedColor: '#FFFFFF', // 选中项的白文字
      itemSelectedBg: '#7B68EE',    // 选中项的紫色背景
      itemHoverBg: '#f8f9ff',       // 悬停背景色
      itemBorderRadius: 8,
      itemPaddingInline: 24,
      itemMarginInline: 8,
      itemHeight: 48,
      collapsedIconSize: 20,
      collapsedWidth: 80,
      fontSize: 14,
      fontWeight: 500,
    },
    Card: {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // 浮动卡片效果
      borderRadius: 16,
      padding: 24,
      headerBg: '#FFFFFF',
      headerPadding: '20px 24px',
      bodyPadding: '24px',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 16,
      fontSize: 14,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 12,
      colorBorder: '#E8E8E8',
      colorBgContainer: '#FFFFFF',
    },
    Avatar: {
      borderRadius: 8,
      colorBgContainer: '#F5F5F5',
    },
    Divider: {
      colorSplit: '#F0F0F0',
      marginLG: 24,
    },
    Typography: {
      titleMarginBottom: 16,
      titleMarginTop: 0,
    },
  },
}; 