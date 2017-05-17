from aiohttp              import ClientSession
from aiocache             import cached, RedisCache
from aiocache.serializers import PickleSerializer
from sanic                import Sanic, response
import asyncio
import feedparser
import json

ONE_HOUR = 60 * 60

app = Sanic(__name__)
app.static("/static", "./static")
app.static("/", "index.html")

@cached(ttl=ONE_HOUR, cache=RedisCache, key="rssfeed",
        serializer=PickleSerializer(), port=6379, namespace="main",
        endpoint="192.168.1.19")
async def get_feed():
    # Get a URL in the current session
    async def fetch_feed(url, session):
        async with session.get(url) as response:
            return await response.read()

    def parse_entry(source, entry):
        return {
            "title"   : entry.title,
            "link"    : entry.link,
            "date"    : entry.published_parsed,
            "comments": entry.comments if "comments" in entry else None,
            "source"  : source.feed.title,
        }

    def parse_feed(feed):
        source = feedparser.parse(feed)
        return [parse_entry(source, e) for e in source.entries]

    futures = []
    async with ClientSession() as session:
        for url in open("urls.txt").readlines():
            futures.append(
                asyncio.ensure_future(
                    fetch_feed(url.strip(), session)
                )
            )
        response_bodies = await asyncio.gather(*futures)

    flatten = lambda l: [item for sublist in l for item in sublist]
    posts = flatten([parse_feed(f) for f in response_bodies])
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
