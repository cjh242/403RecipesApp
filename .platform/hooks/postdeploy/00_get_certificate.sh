#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d http://recipes.is404.net/ --nginx --agree-tos --email jadenbb@byu.edu