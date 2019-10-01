const feed_options = {
  enable: false,
  canonical_base: 'https://kudo.dev/',
  count: 20,
  feeds: {
    rss2: {
      enable: true,
      file_name: 'rss.xml',
      head_link: {
        enable: true,
        type: 'application/rss+xml',
        title: '%%site_title%% RSS Feed',
      }
    },
    atom1: {
      enable: true,
      file_name: 'feed.atom',
      head_link: {
        enable: true,
        type: 'application/atom+xml',
        title: '%%site_title%% Atom Feed',
      }
    },
    json1: {
      enable: true,
      file_name: 'feed.json',
      head_link: {
        enable: true,
        type: 'application/json',
        title: '%%site_title%% JSON Feed',
      }
    },
  }
};

module.exports = {
    title: 'KUDO',
    base: '/',
    themeConfig: {
        logo: '/images/kudo_horizontal_color@2x.png',
        sidebar: {
            '/docs/': [
              '',
              'architecture',
              'cli',
              'comparison',
              'concepts',
              'contributing',
              'controlled-parameter-changes',
              'developing-operators',
              {
                title: 'Examples',
                children: [
                  'examples/apache-kafka',
                  'examples/apache-zookeeper'
                ]
              },
              'faq',
              'repository',
              {
                title: 'Testing',
                children: [
                  'testing',
                  'testing/asserts',
                  'testing/reference',
                  'testing/steps',
                  'testing/test-environments',
                  'testing/tips'
                ]
              },
              'update-upgrade-plans'
            ],
            '/blog/': [
              {
                title: 'Blog',
                collapsable: false,
                children: [
                  'blog-2019-10-01-kensipe',
                  'announcing-kudo-0.6.0',
                  'announcing-kudo-0.5.0',
                  'announcing-kudo-0.4.0',
                  'announcing-kudo-0.3.0',
                  'announcing-kudo-0.2.0'
                ]
              }
            ],
            '/community/': [
              ''
            ],
            '/internal-docs/': [
              '',
              'blog-index',
              'custom-badge',
              'custom-blocks',
              'events-index'
            ],
        },
        repo: "kudobuilder/kudo",
        repoLabel: "Contribute!",
        docsRepo: "kudobuilder/www",
        docsDir: "content",
        docsBranch: "master",
        editLinks: true,
        editLinkText: "Help us improve this page",
        nav: [
            { text: 'Docs', link: '/docs/' },
            { text: 'Blog', link: '/blog/' },
            { text: 'Community', link: '/community/' }
        ]
    },
    markdown: {
        toc: {
          includeLevel: [2, 3, 4]
        },
        lineNumbers: false,
        extendMarkdown: md => {
            md.use(require('markdown-it-footnote'))
        }
    },
    plugins: [
        ['container', {
            type: 'flag',
            before: name => `<div class="flag"><code class="title" v-pre>${name}</code>`,
            after: '</div>',
        }],
        [ 'feed', feed_options ]
    ]
};
