import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import StarIcon from '@material-ui/icons/Star';
import Divider from '@material-ui/core/Divider';
import _ from 'lodash';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
  },
  container: {
    position: 'relative',
    marginTop: '50px',
    width: '60%',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  catalog: {
    display:'flex',
    justifyContent: 'space-between',
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
  },
  repoName: {
    width: '35%'
  },
  repoDes: {
    width: '55%'
  },
  repoLang: {
    width: '10%'
  }
});

class SimpleTabs extends React.Component {

  constructor(props){
    super(props);
    // this timer is for detecting the time space between two api request.
    var timing = setTimeout(()=>{},0);
  }

  componentDidMount() {
    // add event listner to scrolling
    window.addEventListener('scroll', this.handleScroll);
  }

  state = {
    searching: false,   // determine showing 'repostitory results' or not
    total_count: 0, 
    repoStore:[],       // store the repo data that isn't render yet
    repos: [],          // store the data that is rendered
    loading: false,     // determine if the progress icon should show
    searchKeyWord: '',  // to determine the word last searched.
    page: 1,            // which page should be request  
    end: false,         // if the page scroll to the end
    lastChange: new Date(), // last time change the text field
  };

  // this function send the request to GitHub
  fetchData(str, isAdding) {
    
    fetch(`https://api.github.com/search/repositories?q=${str}&page=${this.state.page}&per_page=100`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: 'GET'
    })
    .then(resp => {
      if(resp.ok) return resp.json();
      else throw Error(resp.statusText);
    })
    .then(data => {
      //Process the response data
      let {total_count, items} = data;
      //if there is no repos from GitHub
      if(!items.length){
        this.setState({
          end: true,
        });
        return;
      }
    
      // Everytime, we store all the request data in repoStore, and we pop out 10 items to repos and render them.
      let repos = items.slice(0, 10);
      let repoStore = items;
      repoStore.splice(0, 10);

      this.setState({
        total_count: total_count,
        repos: isAdding? [...this.state.repos, ...repos]:repos,
        searching: true,
        loading: false,
        searchKeyWord: str,
        repoStore: repoStore,
      });
    })
    .catch(err => {
      console.error(err);
    })
  }

  
  handleScroll = event => {
    // check if the page is scroll to the end
    let distToBottom = Math.max(document.body.offsetHeight - (window.pageYOffset + window.innerHeight), 0);
    if (!this.state.loading && distToBottom <= 20 && !this.state.end) {

      // if there is still data in repoStore, render them!
      if(this.state.repoStore.length){
        let newRepoStore = this.state.repoStore;
        let newRepo = this.state.repoStore.slice(0, 10);
        newRepoStore.splice(0, 10);
        this.setState({
          repoStore: newRepoStore,
          repos: [...this.state.repos, ...newRepo],
        });
      }
      else{
        // No data in repoStore, send request
        this.setState({
          loading: true,
          page: this.state.page + 1,
        });

        this.fetchData(this.state.searchKeyWord, true);
      }
      
    }
  };

  // if we press enter at the textfield, send request
  handleKeyPress = event => {
    if(event.key === 'Enter'){
      if(event.target.value.trim() && event.target.value !== this.state.searchKeyWord){
        this.fetchData(event.target.value, false);
        this.setState({
          loading: true,
        })
      }
    }
  };

  // if textfield has been change, send request. In order to lessen the request, if user didn't type for 3sec, send request
  handleChange = event => {
    clearTimeout(this.timing);
    function foo(str) {
      if(str.trim() && str !== this.state.searchKeyWord){
        this.fetchData(str, false);
        this.setState({
          loading: true,
        })
      }
    }
    
    this.timing = setTimeout(foo.bind(this), 3000, event.target.value);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.container}>
          <Typography 
            component="h2" 
            variant="h1" 
            gutterBottom
          >
            GitHub Repo Finder
          </Typography>
          <TextField
            id="outlined-full-width"
            style={{ margin: 8 }}
            placeholder="Search Repo"
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            onKeyPress = {this.handleKeyPress}
            onChange = {this.handleChange}
          />
          <List className={classes.root}>
            { 
              this.state.searching ? (
              <ListItem className={classes.catalog}>
                <Typography
                  variant="h6" 
                  gutterBottom
                >
                  {this.state.total_count} repository results
                </Typography>
              </ListItem>
              ) : ''
            }
            {
              _.map(this.state.repos, (repo, index) => 
              <div key = {index}>
                <Divider component="li" />
                <ListItem >
                  <ListItemText 
                    className={classes.repoName}
                    primary={
                      <Link href={repo.html_url} className={classes.link}>
                        {repo.full_name}
                      </Link>
                    } 
                    secondary={repo.language} 
                  />
                  <ListItemText 
                    secondary={repo.description} 
                    className={classes.repoDes}
                  />
                  <ListItemIcon
                    className={classes.repoLang}
                  >
                    <StarIcon />
                    <ListItemText primary={repo.stargazers_count} />
                  </ListItemIcon>
                </ListItem>
              </div>
              )
            }
            {
              this.state.loading && !this.state.end ? (
              <div className={classes.progress}>
                <CircularProgress />
              </div>
              ) : ''
            }
            
            
          </List>
        </div>
      </div>
    );
  }
}

SimpleTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTabs);