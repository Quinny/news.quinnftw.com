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

class RssFeed extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var postFeed = this.props.posts.map((post, index) => {
      var extraStyle = post.source in sourceCardStyles ? sourceCardStyles[post.source] : {};
      return (
        <div className="row" key={index}>
          <div className="col-md-8 offset-md-2 col-xs-12">
            <div className="card" style={extraStyle}>
              <div className="card-block">
                <h4 className="card-title">
                  <a href={post.link}>{post.title}</a>
                </h4>
                <h6 className="card-subtitle mb-2 text-muted">{post.source}</h6>
                {post.comments &&
                  <a href={post.comments} className="card-link">Comments</a>}
              </div>
            </div>
          </div>
        </div>
      );
    });

    return <div>{postFeed}</div>;
  }
}

$(document).ready(() => {
  $.get("/api/feed", posts => {
    ReactDOM.render(
        <RssFeed posts={JSON.parse(posts)}/>,
        document.getElementById('rssfeed')
    );
  });
});
