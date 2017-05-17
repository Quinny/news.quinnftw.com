class RssFeed extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var postFeed = this.props.posts.map((post, index) => {
      return (
        <div className="row" key={index}>
          <div className="col-md-8 offset-md-2 col-xs-12">
            <div className="card">
              <div className="card-block">
                <h4 className="card-title">
                  <a href={post.link}>{post.title}</a>
                </h4>
                <h6 className="card-subtitle mb-2 text-muted">{post.source}</h6>
                {post.comments && <a href={post.comments} className="card-link">Comments</a>}
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
