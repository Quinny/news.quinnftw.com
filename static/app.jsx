// Preset styles for certain news sources.  These styles should mimic the
// actual style of the page.
const sourceCardStyles = {
  "Hacker News": {
    borderColor: "orange",
    backgroundColor: "rgba(255,165,0,0.1)"
  },
  "the morning paper": {
    borderColor: "purple",
    backgroundColor: "rgba(128,0,128,0.1)"
  },
  "Troy Hunt's Blog": {
    borderColor: "green",
    backgroundColor: "rgba(0,128,0,0.1)"
  },
  "QuinnFTW.com": {
    borderColor: "blue",
    backgroundColor: "rgba(0,0,255,0.1)"
  },
  "MalwareTech": {
    borderColor: "cyan",
    backgroundColor: "rgba(0,255,255,0.1)"
  }
};

// String hash function, cherry picked from:
// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Gnerate n random values with a seed.  The built in Javascript random does
// not support seeds.
// http://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function seededRandomValues(seed, n) {
  var values = [];
  for (var i = 0; i < n; ++i) {
    var x = Math.sin(seed++) * 10000;
    values.push(x - Math.floor(x));
  }
  return values;
}

// Generate a random color with the given seed.  The color is average with a
// bias to prevent the generation of wacky colors.
// http://stackoverflow.com/questions/43044/algorithm-to-randomly-generate-an-aesthetically-pleasing-color-palette
function randomColor(seed) {
  var color = seededRandomValues(seed, 3).map(x => x * 255);
  var bias  = [173, 216, 230];
  return color.map((v, i) => Math.floor((v + bias[i]) / 2));
}

// Helper for creating a string compatible with CSS.
function colorString(rgb, a) {
  return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
}

// RssFeed component displays the posts fetched from the API.
class RssFeed extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var postFeed = this.props.posts.map((post, index) => {
      // If the news source has a predefined color, then use that to style the
      // card.  Otherwise, we generate a random color seeded with the hash code
      // of the source.  Seeding with the source ensures that the given source
      // will be consistently colored across page loads.
      var color      = randomColor(post.source.hashCode());
      var extraStyle = post.source in sourceCardStyles ?
                       sourceCardStyles[post.source] : {
                          backgroundColor: colorString(color, "0.1"),
                          borderColor: colorString(color, "1")
                       };

      return (
        <div className="row" key={index}>
          <div className="col-md-8 offset-md-2 col-xs-12">
            <div className="card" style={extraStyle}>
              <div className="card-block">
                <h4 className="card-title">
                  <a href={post.link} target="_">{post.title}</a>
                </h4>
                <h6 className="card-subtitle mb-2 text-muted">{post.source} ({index + 1}/{this.props.posts.length})</h6>
                {post.comments &&
                  <a href={post.comments} target="_" className="card-link">Comments</a>}
              </div>
            </div>
          </div>
        </div>
      );
    });

    return <div>{postFeed}</div>;
  }
}

// Fetch the feed from the API and render the feed.
$(document).ready(() => {
  $.get("/api/feed", posts => {
    ReactDOM.render(
        <RssFeed posts={JSON.parse(posts)}/>,
        document.getElementById('rssfeed')
    );
  });
});
