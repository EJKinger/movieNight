import React from 'react';
import ReactDOM from 'react-dom';


var data = [
  {author: "Pete Hunt", text: "This is one comment"},
  {author: "Jordan Walke", text: "This is *another* comment"}
];

 
class CommentBox extends React.Component {
  render () {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.props.data} />
        <CommentForm />
      </div>
    )
  }
}

class CommentList extends React.Component {
  render () {
    let commentNodes = this.props.data.map( (comment) => {
      return (
        <div className="commentList">
          {commentNodes}
        </div>
      );
    });

    return(
      <div className="commentList">
        <Comment author="Pete Hunt">This is one comment (from data)</Comment>
        <Comment author="Jordan Walke">This is *another* comment (from data)</Comment>
      </div>
    )

  }
};
class CommentForm extends React.Component {
  render () {
    return (
      <div className="commentForm">
        Hello, world! I am a CommentForm.
      </div>
    )
  }
};

class Comment extends React.Component {
  rawMarkup () {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  };

  render () {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
};

ReactDOM.render(
  <CommentBox data={data} />,
  document.getElementById('content')
);