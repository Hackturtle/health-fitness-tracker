"""Extract the selected CoFID 2021 food records; no network or inferred nutrient values.
Usage: python scripts/nutrition/import-cofid.py /path/to/official-cofid-2021.xlsx
"""
import json, sys, uuid, zipfile, hashlib
from pathlib import Path
import xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[2]
source=Path(sys.argv[1])
ns={'x':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(source) as z:
    strings=[''.join(e.itertext()) for e in ET.fromstring(z.read('xl/sharedStrings.xml'))]
    rows={}
    for row in ET.fromstring(z.read('xl/worksheets/sheet4.xml')).findall('.//x:sheetData/x:row',ns):
        values={}
        for c in row:
            v=c.find('x:v',ns)
            text=v.text if v is not None else ''
            values[c.get('r').rstrip('0123456789')]=strings[int(text)] if c.get('t')=='s' else text
        if values.get('A'): rows[values['A']]=values
    assert rows['Food Code']['M']=='Energy (kcal) (kcal)' and rows['Food Code']['L']=='Carbohydrate (g)'
foods=[]
for item in json.loads((root/'scripts/nutrition/selection.json').read_text()):
    r=rows[item['code']]
    trace=[]
    values={}
    for name,col in [('kcal','M'),('protein','J'),('carbs','L'),('fat','K')]:
        value=r[col]
        if value=='Tr':
            trace.append(name)
            values[name]=0
        else:
            # Missing or unknown (N) values deliberately fail; they are never zero-filled.
            values[name]=round(float(value),4)
    foods.append({'id':str(uuid.uuid5(uuid.NAMESPACE_URL,'https://fitness-os.local/cofid/2021/'+item['code'])),
        'name':r['B'],'unit':'g','preparation':item['preparation'],**values,
        'source':{'dataset':'CoFID2021','code':item['code'],'foodName':r['B'],'trace':trace}})
foods.sort(key=lambda f:f['name'].lower())
(root/'lib/food-library.json').write_text(json.dumps(foods,indent=2,ensure_ascii=False)+'\n')
(root/'scripts/nutrition/source-manifest.json').write_text(json.dumps({'dataset':'CoFID 2021','sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'records':len(foods),'url':'https://assets.publishing.service.gov.uk/media/60538b91e90e07527df82ae4/McCance_Widdowsons_Composition_of_Foods_Integrated_Dataset_2021..xlsx'},indent=2)+'\n')
print(f'Extracted {len(foods)} foods; {sum(bool(f["source"]["trace"]) for f in foods)} records have explicitly labelled trace values.')
