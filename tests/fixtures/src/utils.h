#ifndef UTILS_H
#define UTILS_H

#include <string>
#include <memory>

namespace utils {

template<typename T>
class Pool {
public:
    std::unique_ptr<T> acquire() {
        return std::make_unique<T>();
    }
};

inline std::string concat(const std::string& a, const std::string& b) {
    return a + b;
}

} // namespace utils

#endif // UTILS_H
