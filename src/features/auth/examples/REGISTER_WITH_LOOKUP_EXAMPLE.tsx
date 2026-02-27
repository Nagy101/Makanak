/**
 * EXAMPLE: How to integrate governorates lookup in RegisterPage
 *
 * Add this to the RegisterPage to allow users to select their governorate during registration
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGovernorates } from "@/features/lookup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Update the schema to include governorate
const updateSchema = z.object({
  // ... existing fields ...
  governorateId: z.string().optional(),
});

/**
 * Usage in RegisterPage component:
 */
const RegisterPageExample = () => {
  const { register, watch, setValue } = useForm();
  const { governorates, loading: loadingGovernorates } = useGovernorates();

  return (
    <div className="space-y-2">
      <Label htmlFor="governorate">Governorate (Optional)</Label>
      <Select
        value={watch("governorateId") || ""}
        onValueChange={(value) => setValue("governorateId", value)}
      >
        <SelectTrigger className="h-11" disabled={loadingGovernorates}>
          <SelectValue
            placeholder={
              loadingGovernorates ? "Loading..." : "Select Governorate"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {governorates.map((gov) => (
            <SelectItem key={gov.id} value={gov.id.toString()}>
              {gov.nameEn || gov.nameAr || "Unknown"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RegisterPageExample;
