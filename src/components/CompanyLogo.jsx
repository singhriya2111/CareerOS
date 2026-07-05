import { useState, useEffect } from 'react';

export default function CompanyLogo({ company, url, className = "w-10 h-10" }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (url) {
      try {
        const domain = new URL(url).hostname;
        setImgSrc(`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`);
        setError(false);
      } catch (e) {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [url]);

  if (error || !imgSrc) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-gray-100 dark:bg-black/40 text-gray-700 dark:text-gray-300 font-bold ${className}`}>
        {company ? company.charAt(0).toUpperCase() : '?'}
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={`${company} logo`} 
      onError={() => setError(true)}
      className={`rounded-full object-cover bg-white ${className}`}
    />
  );
}
