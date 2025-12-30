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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <i className={`fas ${feature.icon} text-green-600 text-xl mt-1`} />
            <div className="flex-1">
              <span className="block font-medium text-gray-800">{feature.name}</span>
              <span className="block text-sm text-gray-600">{feature.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}