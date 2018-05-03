from aiohttp              import ClientSession
from aiocache             import cached, SimpleMemoryCache
from aiocache.serializers import PickleSerializer
from datetime             import datetime
from sanic                import Sanic, response
import asyncio
import feedparser
import json

ONE_HOUR = 60 * 60

app = Sanic(__name__)
app.static("/static", "./static")
app.static("/", "index.html")

# Set the user agent to let target sites know who I am and hopefully not block
# me.
ADDITIONAL_HEADERS = {
    "User-Agent": "news.quinnftw.com - Personal news aggregation service"
}

# Pull the RSS feed from each of the sources and parse it into the format
# expected by the front-end.  Only posts within the past three days are kept
# to prevent noise. Results are cached for an hour in RAM.
@cached(ttl=ONE_HOUR, cache=SimpleMemoryCache, key="rssfeed",
        serializer=PickleSerializer(), namespace="main")
async def get_feed():
    # Fetch the provided url and return the raw response body.
    async def fetch_feed(url, session):
        async with session.get(url) as response:
            return await response.read()

    # Pull out needed information from an entry in an RSS feed.
    def parse_entry(source, entry):
        return {
            "title"   : entry.title,
            "link"    : entry.link,
            "date"    : entry.published_parsed,
            "comments": entry.comments if "comments" in entry else None,
            "source"  : source.feed.title,
        }

    # Only posts from the last 3 days are deemed relevant.
    def is_relevant(post):
        # Filter out posts which don't have a date. This is here because one
        # time nytimes.com posted a junk RSS entry which crashed my app.
        if post.get("date") is None:
            return False
        now       = datetime.now()
        # Feed parser provides two extraneous fields in the date not needed
        # in the datetime constructor.
        posted_on = datetime(*post["date"][:-2])
        return (now - posted_on).days <= 3

    # Parse the feed and return a list of relevant posts.
    def parse_feed(feed):
        source = feedparser.parse(feed)
        return filter(
                is_relevant,
                [parse_entry(source, e) for e in source.entries]
        )

    # Pull from each feed, extract the relevant posts, and sort them by
    # date (newest to oldest).
    async with ClientSession(headers=ADDITIONAL_HEADERS) as session:
        response_bodies = await asyncio.gather(*[
            asyncio.ensure_future(
                fetch_feed(url, session)
            ) for url in open("urls.txt").read().splitlines()
        ])

    flatten = lambda l: [item for sublist in l for item in sublist]
    posts   = flatten([parse_feed(f) for f in response_bodies])
    return json.dumps(
            sorted(
                posts,
                key=lambda post: post["date"],
                reverse=True
            )
        )

@app.route("/api/feed")
async def feed(request):
    return response.json(await get_feed())

if __name__ == '__main__':
    app.run()
