import { useMemo } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../config";
import { posts } from "virtual:posts";
import type { Post } from "../posts-data.d";

function getCategoryStats(posts: Post[]): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const post of posts) {
    const cat = post.meta.category || "未分类";
    map[cat] = (map[cat] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function getTagStats(posts: Post[]): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.meta.tags ?? []) {
      map[tag] = (map[tag] ?? 0) + 1;
    }
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function getTimeStats(posts: Post[]): { year: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const post of posts) {
    const year = (post.meta.date || "").slice(0, 4) || "未分类";
    map[year] = (map[year] ?? 0) + 1;
  }
  const years = Object.keys(map).sort((a, b) => b.localeCompare(a));
  return years.map((year) => ({ year, count: map[year] }));
}

export default function About() {
  const {
    avatar,
    name,
    occupation,
    location,
    description,
    motto,
    skills,
    contact,
    links,
  } = siteConfig.about;

  const categoryStats = useMemo(() => getCategoryStats(posts), []);
  const tagStats = useMemo(() => getTagStats(posts), []);
  const timeStats = useMemo(() => getTimeStats(posts), []);

  return (
    <div className="about-page">
      <h1>关于</h1>
      
      <div className="about-card">
        <img
          src={avatar}
          alt="头像"
          className="about-avatar"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="about-info">
          <h2 className="about-name">{name}</h2>
          <p className="about-occupation">{occupation}</p>
          <p className="about-location">{location}</p>
          <p className="about-description">{description}</p>
          <p className="about-motto">{motto}</p>
        </div>
      </div>

      <section className="about-section">
        <h2 className="about-section-title">技能</h2>
        <div className="about-skills">
          {skills.map((skill, index) => (
            <span key={index} className="about-skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">联系方式</h2>
        <div className="about-contact">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="about-contact-link">
              {contact.email}
            </a>
          )}
          {contact.github && (
            <a href={contact.github} target="_blank" rel="noopener noreferrer" className="about-contact-link">
              GitHub
            </a>
          )}
          {contact.twitter && (
            <a href={contact.twitter} target="_blank" rel="noopener noreferrer" className="about-contact-link">
              Twitter
            </a>
          )}
        </div>
      </section>

      {links.length > 0 && (
        <section className="about-section">
          <h2 className="about-section-title">其他链接</h2>
          <div className="about-links">
            {links.map((link, index) => (
              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="about-link">
                {link.name}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="about-stats">
        <h2 className="about-stats-title">博客统计</h2>
        <div className="about-stats-grid">
          <div className="about-stats-block">
            <h3 className="about-stats-block-title">按类别</h3>
            <ul className="about-stats-list">
              {categoryStats.map(({ name, count }) => (
                <li key={name}>
                  <Link to={`/categories/${encodeURIComponent(name)}`}>
                    {name}
                  </Link>
                  <span className="about-stats-count">{count} 篇</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="about-stats-block">
            <h3 className="about-stats-block-title">按标签</h3>
            <ul className="about-stats-list">
              {tagStats.map(({ name, count }) => (
                <li key={name}>
                  <Link to={`/tags/${encodeURIComponent(name)}`}>{name}</Link>
                  <span className="about-stats-count">{count} 篇</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="about-stats-block">
            <h3 className="about-stats-block-title">按时间</h3>
            <ul className="about-stats-list">
              {timeStats.map(({ year, count }) => (
                <li key={year}>
                  <Link to={`/archive`}>{year}</Link>
                  <span className="about-stats-count">{count} 篇</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
