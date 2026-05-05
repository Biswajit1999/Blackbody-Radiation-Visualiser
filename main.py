import numpy as np
import matplotlib.pyplot as plt

H = 6.62607015e-34
C = 2.99792458e8
K = 1.380649e-23

def planck(wavelength_m, temperature_k):
    a = 2 * H * C**2
    b = H * C / (wavelength_m * K * temperature_k)
    return a / (wavelength_m**5 * (np.exp(b) - 1))

def main():
    temperature = float(input("Enter stellar temperature in Kelvin, e.g. 5778: "))

    wavelength_nm = np.linspace(100, 3000, 3000)
    wavelength_m = wavelength_nm * 1e-9

    intensity = planck(wavelength_m, temperature)
    intensity = intensity / np.max(intensity)

    peak_nm = 2.897771955e6 / temperature

    plt.figure(figsize=(10, 5))
    plt.plot(wavelength_nm, intensity, label=f"T = {temperature:.0f} K")
    plt.axvline(peak_nm, linestyle="--", label=f"Peak = {peak_nm:.1f} nm")

    plt.axvspan(380, 750, alpha=0.12, label="Visible range")

    plt.xlabel("Wavelength (nm)")
    plt.ylabel("Normalised intensity")
    plt.title("Blackbody Radiation Curve")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()

    plt.savefig("outputs/blackbody_curve.png", dpi=300)
    plt.show()

    print(f"Peak wavelength: {peak_nm:.1f} nm")
    print("Plot saved to outputs/blackbody_curve.png")

if __name__ == "__main__":
    main()
