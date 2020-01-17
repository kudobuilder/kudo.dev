# Community Resources

The `CommunityResources` component renders data from [resources.json](https://github.com/kudobuilder/www/tree/master/content/community/assets/resources.json) which contains an array of items like the following:

```json
{
  "resourceType": "Event",
  "date": "2019-06-27",
  "title": "Writing Operators with KUDO",
  "details": "Content from a talk given at some conference.",
  "author": "Kurt Dontremember",
  "url": "https://meetup.com/group/event",
  "video": "https://youtu.be/link-to-video",
  "slides": "https://docs.google.com/presentation/link-to-slides/"
}
```

Items follow this format:

```yaml
type: object
properties:
  resourceType:
    type: string
    enum: [Event, Tutorial, Post]
  title:
    type: string
    description: The title of this resource.
  date:
    type: date
  details:
    type: string
    description: Any additional details about this resource.
  author:
    type: string
    description: The original author or authors.
  video:
    type: string
    description: A link to a video, if provided.
  slides:
    type: string
    description: A link to the slides, if provided.
  url:
    type: string
    description: A link to the resource, if provided.
required:
- resourceType
- title
```

At the moment, community resources are listed on the [Community page](https://kudo.dev/community/#community-content).
