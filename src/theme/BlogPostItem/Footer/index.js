import React from 'react';
import Footer from '@theme-original/BlogPostItem/Footer';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function ShareButtons() {
  const {metadata} = useBlogPost();
  const {siteConfig} = useDocusaurusContext();
  const fullUrl = `${siteConfig.url}${metadata.permalink}`;
  const title = metadata.title;

  const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;

  return (
    <div className="share-buttons">
      <span className="share-buttons__label">Share:</span>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-buttons__btn share-buttons__btn--x"
        title="Share on X"
      >
        𝕏
      </a>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-buttons__btn share-buttons__btn--linkedin"
        title="Share on LinkedIn"
      >
        in
      </a>
    </div>
  );
}

export default function FooterWrapper(props) {
  return (
    <>
      <Footer {...props} />
      <ShareButtons />
    </>
  );
}
