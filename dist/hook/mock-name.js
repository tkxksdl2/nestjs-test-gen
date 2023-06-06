"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockName = void 0;
function mockName(str, mockPrefix = "mock") {
    return mockPrefix + capitalizeFirst(str);
}
exports.mockName = mockName;
function capitalizeFirst(str) {
    return str.replace(/^\w/, (match) => match.toUpperCase());
}
//# sourceMappingURL=mock-name.js.map