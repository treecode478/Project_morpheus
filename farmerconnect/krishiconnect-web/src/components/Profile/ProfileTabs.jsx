import { useState } from 'react';

const TABS = [
  { id: 'posts', label: 'Posts', icon: '📄' },
  { id: 'gallery', label: 'Gallery', icon: '🖼️' },
  { id: 'activity', label: 'Activity', icon: '⚡' },
];

export default function ProfileTabs({ userId, isOwnProfile }) {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div style={{ marginTop: 24 }}>
      <div className="profile-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 0', minHeight: 200 }}>
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">Posts from this user will appear here. Connect the posts API when ready.</p>
          </div>
        )}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <p className="col-span-full text-slate-600 text-sm">Gallery images will appear here.</p>
          </div>
        )}
        {activeTab === 'activity' && (
          <div>
            <p className="text-slate-600 text-sm">Recent activity will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
