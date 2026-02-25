#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> items;
    for (int i = 0; i < 100; i++) {
        items.push_back(std::to_string(i));
    }

    for (auto item : items) {  // Should flag: copy in range-for
        std::cout << item << std::endl;  // Should flag: std::endl in loop
    }

    int* raw = new int(42);  // Should flag: raw owning pointer
    std::cout << *raw << std::endl;
    delete raw;

    return 0;
}
