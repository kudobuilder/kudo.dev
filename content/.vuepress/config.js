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
              'what-is-kudo',
              {
                title: 'Developing Operators',
                children: [
                  'developing-operators/getting-started',
                  'developing-operators/packages',
                  'developing-operators/tasks',
                  'developing-operators/plans',
                  'developing-operators/parameters',
                  'developing-operators/templates',
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
              {
                title: 'Runbooks',
                children: [
                  {
                    title: 'Admin',
                    children: [
                      'runbooks/admin/initialize-kudo',
                      'runbooks/admin/debug-kudo',
                      'runbooks/admin/create-operator',
                      'runbooks/admin/create-kudo-package',
                      'runbooks/admin/add-operator-to-repository',
                      'runbooks/admin/local-repo',
                      'runbooks/admin/remove-kudo'
                    ]
                  },
                  // The per-operator modules included below are generated by
                  // /scripts/embed-operator-docs.sh
                  {
                    title: 'Kafka',
                    children: require('./kafka').children
                  },
                  {
                    title: 'Cassandra',
                    children: require('./cassandra').children
                  },
                  {
                    title: 'Spark',
                    children: require('./spark').children
                  },
                  {
                    title: 'Elastic',
                    children: require('./elastic').children
                  }
                ]
              },
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
              },
              'contributing'
            ],
            '/blog/': [
              {
                title: 'Blog',
                collapsable: false              }
            ],
            '/community/': [
              '',
              'team/'
            ],
            '/internal-docs/': [
              {
                title: 'Writing Documentation',
                collapsable: false,
                children: [
                  '',
                  'blog-index',
                  'custom-badge',
                  'custom-blocks',
                  'events-index',
                  'community-resources'
                ]
              }
            ],
        },
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
            md.use(require('markdown-it-imsize'))
        }
    },
    plugins: [
        ['container', {
            type: 'flex-box',
            before: type => `<div class="flex-box ${type}">`,
            after: '</div>',
        }],
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
            before: name => `<div class="teaser custom-block"><h2 class="custom-block-title">${name}</h2>`,
            after: '</div>',
        }],
        [ 'feed', feed_options ],
        ['check-md', {
          pattern: '**/*.md',
        }]
    ]
};
