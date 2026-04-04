const { getRandomItem } = require('../utils/helpers');

const problemCache = {}; // in memory cache

// ─── Curated Problem Lists (fallback for random)
const CURATED_PROBLEMS = {
  easy: [
    'two-sum', 'palindrome-number', 'roman-to-integer', 'valid-parentheses',
    'merge-two-sorted-lists', 'remove-duplicates-from-sorted-array',
    'best-time-to-buy-and-sell-stock', 'valid-anagram', 'contains-duplicate',
    'maximum-subarray', 'climbing-stairs', 'reverse-linked-list',
    'invert-binary-tree', 'linked-list-cycle', 'maximum-depth-of-binary-tree',
    'single-number', 'fizz-buzz', 'move-zeroes', 'power-of-three',
    'intersection-of-two-linked-lists', 'missing-number', 'reverse-string',
    'ransom-note', 'first-unique-character-in-a-string', 'majority-element'
  ],
  medium: [
    'add-two-numbers', 'longest-substring-without-repeating-characters',
    'longest-palindromic-substring', '3sum', 'letter-combinations-of-a-phone-number',
    'container-with-most-water', 'group-anagrams', 'merge-intervals',
    'sort-colors', 'subsets', 'word-search', 'validate-binary-search-tree',
    'binary-tree-level-order-traversal', 'construct-binary-tree-from-preorder-and-inorder-traversal',
    'kth-smallest-element-in-a-bst', 'course-schedule', 'implement-trie-prefix-tree',
    'coin-change', 'product-of-array-except-self', 'top-k-frequent-elements',
    'decode-ways', 'unique-paths', 'jump-game', 'rotate-image',
    'spiral-matrix', 'set-matrix-zeroes', 'search-in-rotated-sorted-array'
  ],
  hard: [
    'median-of-two-sorted-arrays', 'regular-expression-matching',
    'merge-k-sorted-lists', 'trapping-rain-water', 'wildcard-matching',
    'n-queens', 'minimum-window-substring', 'largest-rectangle-in-histogram',
    'maximal-rectangle', 'word-ladder', 'word-break-ii', 'binary-tree-maximum-path-sum',
    'longest-consecutive-sequence', 'word-search-ii', 'serialize-and-deserialize-binary-tree',
    'alien-dictionary', 'longest-increasing-path-in-a-matrix', 'burst-balloons',
    'count-of-smaller-numbers-after-self', 'the-skyline-problem'
  ]
};

/**
 * Fetch a single problem's data from LeetCode GraphQL API (with caching).
 */
async function fetchProblem(slug) {
  if (problemCache[slug]) return problemCache[slug];

  const query = `
    query getQuestion($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        content
        exampleTestcaseList
        codeSnippets { lang langSlug code }
        topicTags { name slug }
        hints
        stats
      }
    }
  `;

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug: slug }
      })
    });

    if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`);

    const data = await res.json();
    const q = data?.data?.question;
    if (!q) throw new Error('Problem not found');

    let stats = {};
    try { stats = JSON.parse(q.stats); } catch {}

    const result = {
      id: q.questionId,
      title: q.title,
      slug: q.titleSlug,
      difficulty: q.difficulty,
      content: q.content,
      exampleTestcases: q.exampleTestcaseList || [],
      codeSnippets: (q.codeSnippets || []).map(s => ({ lang: s.lang, langSlug: s.langSlug, code: s.code })),
      tags: (q.topicTags || []).map(t => ({ name: t.name, slug: t.slug })),
      hints: q.hints || [],
      acceptance: stats.acRate || null,
      totalSubmissions: stats.totalSubmissionRaw || null,
      totalAccepted: stats.totalAcceptedRaw || null
    };

    // Store in cache so we don't spam LeetCode
    problemCache[slug] = result;
    return result;
  } catch (err) {
    console.error(`Failed to fetch problem "${slug}":`, err.message);
    throw err;
  }
}

/**
 * Get a random problem slug, trying the LeetCode API first, then falling back to curated list.
 */
async function getRandomProblemSlug(difficulty = 'easy') {
  try {
    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
          total: totalNum
          questions: data {
            titleSlug
            difficulty
            paidOnly: isPaidOnly
          }
        }
      }
    `;

    const diffMap = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };
    const diffVal = diffMap[difficulty] || 'EASY';

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query,
        variables: {
          categorySlug: 'all-code-essentials',
          limit: 50,
          skip: Math.floor(Math.random() * 200),
          filters: { difficulty: diffVal }
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const questions = data?.data?.problemsetQuestionList?.questions;
      if (questions && questions.length > 0) {
        // Filter out paid LeetCode Premium problems
        const free = questions.filter(q => !q.paidOnly);
        if (free.length > 0) {
          return getRandomItem(free).titleSlug;
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch random problem from LeetCode API:', err.message);
  }

  // Fallback to our hardcoded list if the API fails or blocks us
  const list = CURATED_PROBLEMS[difficulty] || CURATED_PROBLEMS.easy;
  return getRandomItem(list);
}

module.exports = {
  problemCache,
  CURATED_PROBLEMS,
  fetchProblem,
  getRandomProblemSlug,
};