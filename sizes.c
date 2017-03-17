#include <stdio.h>

int main(void) {

    printf("sizeof(char): %lu\nsizeof(short): %lu\nsizeof(long): %lu\nsizeof(size_t): %lu\nsizeof(float): %lu\nsizeof(double): %lu\nsizeof(int): %lu\n",
        sizeof(char), sizeof(short), sizeof(long), sizeof(size_t), sizeof(float), sizeof(double), sizeof(int));

    return 0;
}