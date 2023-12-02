#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d RecipesCheap.us-east-1.elasticbeanstalk.com  --nginx --agree-tos --email cjh242@byu.edu