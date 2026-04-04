const { getRandomItem } = require('../utils/helpers');

const problemCache = {}; // Cache for fetched problems by difficulty

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

