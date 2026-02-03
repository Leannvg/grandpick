import Select from "react-select";

function SearchableSelect({
  options = [],
  value,
  onChange,
  isInvalid = false,
  isDisabled = false,
  placeholder = "Seleccionar...",
  getOptionDisabled = () => false,
}) {
  const formattedOptions = options.map(opt => ({
    value: opt._id,
    label: opt.gp_name || opt.name,
    timezone: opt.timezone,
    isDisabled: getOptionDisabled(opt),
    original: opt, // por si luego querés más datos
  }));

  const currentValue = formattedOptions.find(o => o.value === value) || null;

  return (
    <Select
      className={`react-select-container ${isInvalid ? "is-invalid" : ""}`}
      classNamePrefix="react-select"   // 👈 NECESARIO PARA ESTILOS
      value={currentValue}
      onChange={(selected) => onChange(selected)}
      options={formattedOptions}
      isSearchable={true}
      isDisabled={isDisabled}
      isOptionDisabled={(opt) => opt.isDisabled}
      placeholder={placeholder}
    />
  );
}

export default SearchableSelect;
