const JOB_TITLE_SELECTOR =
  '.job-details-jobs-unified-top-card__job-title a'
const COMPANY_SELECTOR =
  '.job-details-jobs-unified-top-card__company-name a'

function extractLinkedInJobInfo(): { jobTitle: string; company: string } {
  const jobTitleEl = document.querySelector(JOB_TITLE_SELECTOR)
  const companyEl = document.querySelector(COMPANY_SELECTOR)

  return {
    jobTitle: jobTitleEl?.textContent ?? '',
    company: companyEl?.textContent ?? '',
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_LINKEDIN_JOB_INFO') {
    sendResponse(extractLinkedInJobInfo())
  }
})
