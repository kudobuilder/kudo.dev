FROM node:10
EXPOSE 8080

COPY scripts/run.sh /run.sh
RUN chmod +x /run.sh
CMD ["/run.sh"]
