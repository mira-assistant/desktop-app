'use client';

export default function FeaturesCard() {
  const features = [
    {
      icon: 'fa-brain',
      name: 'Advanced NLP Processing',
      description: 'Intelligent text analysis and context understanding',
    },
    {
      icon: 'fa-users',
      name: 'Speaker Clustering',
      description: 'Automatically identify and separate different speakers',
    },
    {
      icon: 'fa-clipboard-list',
      name: 'Context Summarization',
      description: 'Generate concise summaries of conversations',
    },
    {
      icon: 'fa-database',
      name: 'Database Integration',
      description: 'Seamlessly store and search interaction history',
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#e5e7eb] p-6">
      <h3 className="text-xl font-semibold text-[#1f2937] mb-4">Features</h3>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 border border-[#e5e7eb] rounded-lg bg-[rgba(240,255,250,0.5)] transition-all duration-200 min-h-[60px] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,255,136,0.15)] hover:border-[#00ff88]"
          >
            <i className={`fas ${feature.icon} text-[#00ff88] text-base w-5 text-center mt-0.5 flex-shrink-0`} />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-poppins font-semibold text-[#1f2937] text-base leading-tight">
                {feature.name}
              </span>
              <span className="text-[13px] text-[#6b7280] leading-snug">
                {feature.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}