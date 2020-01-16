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
              {
                  title: "Comparison",
                  children: [
                      "comparison/overview",
                      "comparison/infrastructure-as-code",
                      "comparison/static-yaml",
                      "comparison/high-level-controllers",
                      "comparison/custom-controllers"
                  ]
              },
              'contributing',
              'features',
                {
                    title: 'Developing Operators',
                    children: [
                        'concepts',
                        'first-operator',
                        'tasks',
                        'operator-parameters',
                        {
                            title: 'Examples',
                            children: [
                                'examples/apache-flink',
                                'examples/apache-kafka',
                                'examples/apache-zookeeper'
                            ]
                        },
                    ]
                },
              'faq',
              'repository',
              {
                title: 'Testing',
                children: [
                  'testing',
                  'testing/asserts-errors',
                  'testing/reference',
                  'testing/steps',
                  'testing/test-environments',
                  'testing/tips'
                ]
              }
            ],
            '/blog/': [
              {
                title: 'Blog',
                collapsable: false,
                children: [
                  'blog-2019-12-06-mesos-to-kudo',
                  'blog-2019-10-kudo-team',
                  'blog-2019-10-hacktoberfest',
                  'announcing-kudo-0.7.2',
                  'announcing-kudo-0.6.0',
                  'announcing-kudo-0.5.0',
                  'announcing-kudo-0.4.0',
                  'announcing-kudo-0.3.0',
                  'announcing-kudo-0.2.0'
                ]
              }
            ],
            '/community/': [
              '',
              'team/'
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
        ['container', {
            type: 'attribute',
            before: name => `<div class="attribute"><code class="title" v-pre>${name}</code>`,
            after: '</div>',
        }],
        ['container', {
            type: 'teaser',
            before: name => `<div class="teaser custom-block"><p class="custom-block-title">${name}</p>`,
            after: '</div>',
        }],
        [ 'feed', feed_options ]
    ]
};
