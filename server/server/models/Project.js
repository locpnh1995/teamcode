'use strict';

function Project() {
    this.id = '0';
    this.ownerId = '';
    this.projectName = '';
    this.dockerName = '';
    this.createdAt = '';
}

User.prototype.initial = function (projectInfo) {
    if (projectInfo != null) {
        var self = this;

        self.id = projectInfo.id;
        self.ownerId = projectInfo.ownerId;
        self.projectName = projectInfo.projectName;
        self.dockerName = projectInfo.dockerName;
        self.createdAt = projectInfo.createdAt;
    }
    return this;
};

module.exports = Project;
