module.exports = class GraphType {
    static SYSTEM_PERMISSION_LIST = 'SYSTEM_PERMISSION_LIST';

    static SYSTEM_FRIEND_LIST = 'SYSTEM_FRIEND_LIST';

    // static SYSTEM_OBJECT_NEST = 'SYSTEM_OBJECT_NEST';

    static checkValidKey(key) {
        if (key === 'GraphType') {
            return false;
        }
        return GraphType[key] != null;
    }
}
