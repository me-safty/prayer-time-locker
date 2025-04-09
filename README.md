# prayer-time-locker

## to run on ubuntu:

Make it executable:

```
chmod +x /home/user/cron-job.js
```

Edit the crontab:

```
crontab -e
```

Add the line:

```
* * * * * /usr/bin/node /home/user/cron-job.js >> /home/user/cron-job.log 2>&1
```

replace

`/usr/bin/node` => with your node path

`/home/user/cron-job.js` => with your script path

`/home/user/cron-job.log` => with your log file path