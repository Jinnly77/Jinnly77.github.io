# Scroll Animation Design

## 概述

为首页文章列表项添加下滑渐进式动效，使用按顺序延迟的方式实现优雅的阶梯式浮现效果。

## 需求

- 动画类型：上滑+淡入
- 渐进方式：按顺序延迟（每个列表项依次延迟150ms）
- 翻页行为：重新触发动画
- 性能：使用GPU加速的CSS属性

## 架构

### 核心思路

基于现有IntersectionObserver实现，为每个列表项添加基于索引的CSS `transition-delay`，使它们按顺序依次显示。

### 组件改动

**Index.tsx**：
- 为每个`<li className="post-item">`添加`style={{ transitionDelay: \`${index * 150}ms\` }}`
- 保持现有IntersectionObserver逻辑不变
- 翻页时重置所有动画状态

**index.css**：
- 恢复`.post-item`的初始动画样式
- 保持`.post-item.fade-in-visible`的可见状态
- 使用`ease`缓动函数，动画持续时间0.6s

## 实现细节

### Index.tsx修改

```tsx
<li 
  key={`${post.slug}-${currentPage}-${index}`} 
  className="post-item"
  style={{ transitionDelay: `${index * 150}ms` }}
>
```

### index.css修改

```css
.post-item {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease, background 0.15s;
}

.post-item.fade-in-visible {
  opacity: 1;
  transform: translateY(0);
}
```

## 数据流

1. 组件渲染时，根据当前页面的列表项索引计算延迟值
2. IntersectionObserver检测到元素进入视口时，添加`fade-in-visible`类
3. CSS通过`transition-delay`实现渐进式效果
4. 翻页时，重置所有动画状态，基于新索引重新计算延迟

## 性能优化

- 使用`transform`和`opacity`属性，触发GPU加速
- IntersectionObserver的`threshold: 0.05`和`rootMargin`提前触发动画
- 动画使用`ease`缓动，平衡流畅度和性能

## 边缘情况处理

1. **快速滚动**：每个元素有固定的`transitionDelay`，按预设延迟依次显示
2. **空列表**：不渲染列表项，不会触发动画
3. **移动端性能**：GPU加速确保流畅运行
4. **翻页状态**：`useEffect`依赖`currentPage`，每次翻页重新初始化
5. **向上滚动**：元素离开视口上方时重置状态

## 测试要点

- 验证列表项按顺序依次浮现（延迟150ms）
- 确认翻页后动画重新触发
- 测试快速滚动时的表现
- 在移动设备上验证性能
- 检查动画是否影响hover效果
