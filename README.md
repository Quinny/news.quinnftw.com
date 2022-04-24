# news.quinnftw.com

A personal news aggregator for my favourite websites.

<img width="900" alt="news" src="https://user-images.githubusercontent.com/4185619/164989203-42a3173c-63c2-40d2-ae33-9855c0f8eb2a.png">

# How does it work?

The RSS feeds from the `urls.txt` file are fetched, trimmed to posts from the
last 3 days, merged, and sorted in reverse chronological order. This result is
then cached for 1 hour and served to a React front-end via the `/api/feed`
end-point.

# Why don't you use some fancy ML to curate the posts?

I fear this will create a sort of personal echo chamber. The feeds here are
intentionally diverse to prevent myself from only reading tech articles.
